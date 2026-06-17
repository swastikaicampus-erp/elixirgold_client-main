"use client";

import { useEffect, useMemo, useState } from "react";
import { parseRates, validateData, getParserDiagnostics, type ParsedRateRow } from "@/app/services/dataParser";
import { siteConfig } from "@/config/site";
import { buildAdminRateCards, buildLegacyBhav, buildStreamFallback, formatValue, getSelectedCity, type CityOption } from "@/app/services/homeData";
import { resolveCommodityBhav, resolveCityBhavValue } from "@/app/services/cityBhav";
import { fetchCarouselImages, fetchCities, fetchCommodityRates, fetchMetals, type CommodityDashboardRate, type MetalPricePayload } from "@/app/services/homeApi";

export function useHomeData() {
  const [rates, setRates] = useState<ParsedRateRow[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [error, setError] = useState("");
  const [cityError, setCityError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>(siteConfig.sliderImage);
  const [commodityRates, setCommodityRates] = useState<CommodityDashboardRate[]>([]);
  const [commodityMapping, setCommodityMapping] = useState({ indianGoldId: 2753, indianSilverId: 2754 });
  const [metals, setMetals] = useState<MetalPricePayload[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetchCarouselImages(controller.signal)
      .then((images) => {
        if (images.length > 0) {
          setCarouselImages(images);
        }
      })
      .catch((fetchError) => {
        if (!(fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          console.error("Failed to fetch carousel images", fetchError);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchCommodityRates(controller.signal)
      .then((payload) => {
        setCommodityRates(payload.rates);
        setCommodityMapping(payload.mapping);
      })
      .catch((commodityError) => {
        if (!(commodityError instanceof DOMException && commodityError.name === "AbortError")) {
          console.error("Failed to fetch commodity rates", commodityError);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchMetals(controller.signal)
      .then((fetchedMetals) => {
        setMetals(fetchedMetals);
      })
      .catch((metalError) => {
        if (!(metalError instanceof DOMException && metalError.name === "AbortError")) {
          console.error("Failed to fetch metals", metalError);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchCities(controller.signal)
      .then((fetchedCities) => {
        setCities(fetchedCities);

        if (fetchedCities.length > 0) {
          const indore = fetchedCities.find((city) => city.cityName.toLowerCase() === "indore");
          setSelectedCityId((current) => current || (indore ? indore._id : fetchedCities[0]._id));
        }
      })
      .catch((cityFetchError: unknown) => {
        if (!(cityFetchError instanceof DOMException && cityFetchError.name === "AbortError")) {
          setCityError(
            cityFetchError instanceof Error ? cityFetchError.message : "Unable to fetch cities"
          );
          console.error("City fetch error:", cityFetchError);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let activeController = new AbortController();

    const readStream = async (signal: AbortSignal) => {
      try {
        setError("");

        const timestamp = Math.floor(Date.now() / 1000);
        const response = await fetch(`${siteConfig.api.streamUrl}?_=${timestamp}`, { signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const applyData = (textChunk: string) => {
          try {
            const parsedRows = parseRates(textChunk, {
              minFields: 3,
              maxFields: 6,
              allowPartialData: true,
              logWarnings: true,
            });

            const validationIssues = validateData(parsedRows);
            const diagnostics = getParserDiagnostics(textChunk, parsedRows, validationIssues);

            if (parsedRows.length) {
              setRates(parsedRows);
              setLastUpdated(new Date());

              if (process.env.NODE_ENV === "development" && diagnostics.issueCount > 0) {
                console.info("[Diagnostics]", diagnostics);
              }
            }
          } catch (parseError: unknown) {
            setError(
              `Parse error: ${parseError instanceof Error ? parseError.message : "Unknown parser error"}`
            );
          }
        };

        if (!response.body) {
          const textBody = await response.text();
          applyData(textBody);
          return;
        }

        const textBody = await response.text();
        applyData(textBody);
      } catch (streamError: unknown) {
        if (!(streamError instanceof DOMException && streamError.name === "AbortError")) {
          setError(streamError instanceof Error ? streamError.message : "Unable to fetch live rates");
        }
      }
    };

    const start = () => {
      readStream(activeController.signal);
    };

    start();

    const intervalId = setInterval(() => {
      activeController.abort();
      activeController = new AbortController();
      start();
    }, siteConfig.api.refreshMs);

    return () => {
      clearInterval(intervalId);
      activeController.abort();
    };
  }, []);

  const streamBhav = useMemo(() => buildLegacyBhav(rates), [rates]);
  const streamFallback = useMemo(() => buildStreamFallback(rates, commodityMapping), [rates, commodityMapping]);
  const commodityBhav = useMemo(
    () => {
      // Prefer stream data for Indian Gold/Silver as they're live
      const resolved = resolveCommodityBhav(
        commodityRates,
        commodityMapping,
        {
          indianGoldRaw: streamFallback.indianGoldRaw,
          indianSilverRaw: streamFallback.indianSilverRaw,
        }
      );
      
      // Override with stream data if available (stream is primary source)
      return {
        indianGoldRaw: streamFallback.indianGoldRaw ?? resolved.indianGoldRaw,
        indianSilverRaw: streamFallback.indianSilverRaw ?? resolved.indianSilverRaw,
      };
    },
    [commodityRates, commodityMapping, streamFallback]
  );
  const legacyBhav = useMemo(
    () => ({
      ...streamBhav,
      goldJuneBuyRaw: commodityBhav.indianGoldRaw,
      goldJuneBuy: formatValue(commodityBhav.indianGoldRaw),
      silverJulyBuyRaw: commodityBhav.indianSilverRaw,
      silverJulyBuy: formatValue(commodityBhav.indianSilverRaw),
    }),
    [commodityBhav, streamBhav]
  );
  const adminRateCards = useMemo(() => buildAdminRateCards(legacyBhav), [legacyBhav]);
  const selectedCity = useMemo(() => getSelectedCity(cities, selectedCityId), [cities, selectedCityId]);
  const selectedCityGoldAddon = selectedCity?.gold_price ?? 0;
  const selectedCitySilverAddon = selectedCity?.silver_price ?? 0;
  const selectedCityGoldRaw = useMemo(
    () => resolveCityBhavValue(commodityBhav.indianGoldRaw, selectedCityGoldAddon),
    [commodityBhav.indianGoldRaw, selectedCityGoldAddon]
  );
  const selectedCitySilverRaw = useMemo(
    () => resolveCityBhavValue(commodityBhav.indianSilverRaw, selectedCitySilverAddon),
    [commodityBhav.indianSilverRaw, selectedCitySilverAddon]
  );

  return {
    adminRateCards,
    carouselImages,
    cityError,
    cities,
    error,
    lastUpdated,
    metals,
    rates,
    selectedCity,
    selectedCityGoldBhav: formatValue(selectedCityGoldRaw),
    selectedCityGoldRaw,
    selectedCityId,
    selectedCitySilverBhav: formatValue(selectedCitySilverRaw),
    selectedCitySilverRaw,
    setSelectedCityId,
  };
}
