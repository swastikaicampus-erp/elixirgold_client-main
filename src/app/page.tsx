"use client";

import { useHomeData } from "./hooks/useHomeData";
import { formatValue } from "./services/homeData";
import { siteConfig } from "@/config/site";
import Carausel from '@/components/Carousel'
import { PriceCard } from '@/components/PriceCard'
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

function App() {
  const { isLoggedIn, isAdmin } = useAuth();
  const {
    adminRateCards,
    carouselImages,
    cityError,
    cities,
    error,
    lastUpdated,
    metals,
    rates,
    selectedCity,
    selectedCityGoldBhav,
    selectedCityGoldRaw,
    selectedCityId,
    selectedCitySilverBhav,
    selectedCitySilverRaw,
    setSelectedCityId,
  } = useHomeData();

  const rateCards = [
    ...adminRateCards,
    {
      title: selectedCity ? `${selectedCity.cityName} Gold` : "City Gold",
      value: `₹ ${selectedCityGoldBhav}`,
      rawValue: selectedCityGoldRaw,
    },
    {
      title: selectedCity ? `${selectedCity.cityName} Silver` : "City Silver",
      value: `₹ ${selectedCitySilverBhav}`,
      rawValue: selectedCitySilverRaw,
    },
  ];

  return (
    <>
      {/* <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin} /> */}

      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#191919_0%,#0f0f0f_50%,#060606_100%)] text-[#f6e6b8] pb-10">
        <header className="mx-auto max-w-7xl px-4 pb-4 pt-8">
          <div className="rounded-3xl border border-[#45391e] bg-[linear-gradient(135deg,#1b1b1b_0%,#101010_60%,#090909_100%)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)] sm:p-10">
            <div>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-[#f7e6b0] sm:text-5xl">
                {siteConfig.title}
              </h1>
            </div>


            <div className="mt-0 rounded-2xl border border-[#40351e] bg-[#0b0b0b] p-3 text-sm text-[#dac48f]">

              <div className="mt-0 rounded-2xl border border-[#4c4026] bg-[#0e0e0e] px-4 mx-0 py-3 text-sm text-[#f0d58d]">
                <div className="flex flex-wrap items-center justify-between gap-2">


                  <p>
                    Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN") : "Waiting..."}
                  </p>
                </div>
                {error && <p className="mt-2 text-red-400">Error: {error}</p>}


              </div >

              <div className="mt-3 rounded-2xl border border-[#4a3d24] bg-[#0d0d0d] p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {rateCards.map((card) => (
                    <PriceCard key={card.title} title={card.title} value={card.value} rawValue={card.rawValue} />
                  ))}
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-[#4a3d24] bg-[#0d0d0d] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label htmlFor="city-select" className="text-sm font-semibold uppercase tracking-[0.14em] text-[#c7a966]">
                    Select City
                  </label>
                  <div className="relative w-full sm:max-w-sm">
                    <select
                      id="city-select"
                      value={selectedCityId}
                      onChange={(event) => setSelectedCityId(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-[#5a4a2b] bg-[#171717] px-4 py-3 pr-10 text-sm font-semibold uppercase tracking-wide text-[#f5d993] outline-none focus:border-[#d3b475]"
                    >
                      {cities.length === 0 && <option value="">No cities</option>}
                      {cities.map((city) => (
                        <option key={city._id} value={city._id}>
                          {city.cityName}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#c7a966]">▼</span>
                  </div>
                  
                </div>
                {cityError && <p className="mt-2 text-sm text-red-400">City Error: {cityError}</p>}
              </div>
            </div>


          </div>
        </header>

        {metals.length > 0 && (
          <section className="mx-auto mb-8 max-w-7xl px-4">
            <div className="rounded-3xl border border-[#4f4227] bg-[#0b0b0b] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.55)] sm:p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-[#f2d792]">Elixir Gold Prices</h2>
                  
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {metals.map((metal) => (
                  <article key={metal._id} className="rounded-2xl border border-[#534528] bg-[#121212] px-4 py-4 shadow-[0_0_10px_rgba(245,217,147,0.05)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c7a966]">
                      {metal.metal_name}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#f5d993] sm:text-3xl">
                      ₹ {metal.metal_price}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto mb-8 max-w-7xl px-4"><Carausel images={carouselImages} /></div>

        {/* marquee */}
        <div className="mx-auto mb-8 max-w-7xl px-4">
          <div className="w-full overflow-hidden rounded-md bg-linear-to-r from-[#060606] via-[#111] to-[#060606] border-y border-[#3c321e] shadow-[0_0_20px_rgba(245,217,147,0.05)] relative cursor-default">
            <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#060606] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#060606] to-transparent z-10 pointer-events-none"></div>

            <div className="animate-marquee flex items-center py-4">
             
              <div className="flex items-center shrink-0 pr-16">
                <span className="text-[#f5d993] font-semibold tracking-widest text-sm uppercase flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#f5d993] animate-pulse shadow-[0_0_8px_#f5d993]"></span>
                  Welcome to Elixir Gold - Your Trusted Partner in Precious Metals
                </span>
                <span className="text-[#d3b475] font-medium tracking-widest text-sm uppercase px-16 flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#d3b475]"></span>
                  Get the latest live rates directly from our premium platform
                </span>
              </div>
              {/* Second Set for perfectly seamless looping */}
              <div className="flex items-center shrink-0 pr-16" aria-hidden="true">
                <span className="text-[#f5d993] font-semibold tracking-widest text-sm uppercase flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#f5d993] animate-pulse shadow-[0_0_8px_#f5d993]"></span>
                  Welcome to Elixir Gold - Your Trusted Partner in Precious Metals
                </span>
                <span className="text-[#d3b475] font-medium tracking-widest text-sm uppercase px-16 flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#d3b475]"></span>
                  Get the latest live rates directly from our premium platform
                </span>
              </div>
            </div>
          </div>
        </div>

       



        <section className="mx-auto max-w-7xl px-4 pb-10">
          <div className="overflow-hidden rounded-3xl border border-[#4f4227] bg-[#0a0a0a] shadow-[0_20px_45px_rgba(0,0,0,0.55)]">
            <div className="border-b border-[#463a22] bg-[#111] px-5 py-4">
              <h3 className="font-display text-3xl text-[#f2d792]">Market Board</h3>
              <p className="mt-1 text-sm text-[#c8ab6b]">Live rates from old feed integrated in new Elixir black theme</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#1d1710] text-[#f8e7bb]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Instrument</th>
                    <th className="px-4 py-3 font-medium">Buy</th>
                    <th className="px-4 py-3 font-medium">Sell</th>
                    <th className="px-4 py-3 font-medium">High</th>
                    <th className="px-4 py-3 font-medium">Low</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-[#bea15f]">
                        Waiting for stream data...
                      </td>
                    </tr>
                  )}

                  {rates.map((row, index) => (
                    <tr
                      key={row.id}
                      className={index % 2 === 0 ? "bg-[#0f0f0f] text-[#f0d59a]" : "bg-[#151515] text-[#e4c887]"}
                    >
                      <td className="px-4 py-3 font-medium">{row.label}</td>
                      <td className="px-4 py-3">{formatValue(row.buy)}</td>
                      <td className="px-4 py-3">{formatValue(row.sell)}</td>
                      <td className="px-4 py-3">{formatValue(row.high)}</td>
                      <td className="px-4 py-3">{formatValue(row.low)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8">
          <div className="rounded-3xl border border-[#44391f] bg-[#0b0b0b] p-5 sm:p-7">
            <h3 className="font-display text-3xl text-[#f0d38f]">Our Services</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {siteConfig.services.map((item) => (
                <div key={item.title} className="overflow-hidden rounded-xl border border-[#534528] bg-[#121212] flex flex-col group hover:border-[#f2d792] transition-colors">
                  <div className="w-full h-60 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="px-4 py-3 text-sm text-[#e2c27f] w-full text-center font-semibold tracking-wide">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mx-auto mb-8 max-w-7xl px-4">
          <div className="rounded-3xl border border-[#44391f] bg-[#0b0b0b] p-5 sm:p-7 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-sm text-[#e2c27f]">
              &copy; {new Date().getFullYear()} Elixir Gold. All rights reserved.
            </p>
            <div>
                developed by <a href="https://goldberryintrest.web.app/">goldberryintrest.web.app/</a>
            </div>
          </div>
        </footer>


      </main>
    </>
  );
}

export default App;