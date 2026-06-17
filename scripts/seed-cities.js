/**
 * Seed Script: Add sample cities with gold and silver prices
 * 
 * This script adds sample city data to the database for testing
 * and development purposes.
 * 
 * Usage: node scripts/seed-cities.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
  
  return envVars;
}

const env = loadEnv();
const MONGODB_URI = env.DATABASE_URL || env.MONGODB_URI || 'mongodb://localhost:27017/gold_web_app';

const citySchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gold_price: {
      type: Number,
      required: true,
      min: 0,
    },
    silver_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const City = mongoose.model('City', citySchema);

// Sample cities data
const sampleCities = [
  { cityName: 'Delhi', gold_price: 7500, silver_price: 95000 },
  { cityName: 'Mumbai', gold_price: 7600, silver_price: 96000 },
  { cityName: 'Bangalore', gold_price: 7450, silver_price: 94000 },
  { cityName: 'Kolkata', gold_price: 7400, silver_price: 93000 },
  { cityName: 'Chennai', gold_price: 7550, silver_price: 95500 },
  { cityName: 'Hyderabad', gold_price: 7480, silver_price: 94500 },
  { cityName: 'Pune', gold_price: 7520, silver_price: 95000 },
  { cityName: 'Ahmedabad', gold_price: 7460, silver_price: 94200 },
];

async function seedCities() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing cities (optional)
    const existingCount = await City.countDocuments();
    if (existingCount > 0) {
      console.log(`📊 Found ${existingCount} existing cities`);
      console.log('⏭️  Adding new sample cities...\n');
    }

    let addedCount = 0;
    const results = [];

    // Insert sample cities
    for (const cityData of sampleCities) {
      try {
        const city = await City.create(cityData);
        console.log(`✅ Added: ${city.cityName} (Gold: ₹${city.gold_price}, Silver: ₹${city.silver_price})`);
        results.push({ status: 'success', city: city.cityName });
        addedCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipped: ${cityData.cityName} (already exists)`);
          results.push({ status: 'skipped', city: cityData.cityName });
        } else {
          console.log(`❌ Error adding ${cityData.cityName}: ${error.message}`);
          results.push({ status: 'failed', city: cityData.cityName, error: error.message });
        }
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log(`\n📋 Summary:`);
    console.log(`   ✅ Added: ${results.filter(r => r.status === 'success').length}`);
    console.log(`   ⏭️  Skipped: ${results.filter(r => r.status === 'skipped').length}`);
    console.log(`   ❌ Failed: ${results.filter(r => r.status === 'failed').length}`);

    // Show all cities
    const allCities = await City.find().sort({ cityName: 1 });
    console.log(`\n📊 Total cities in database: ${allCities.length}\n`);
    console.log('All Cities:');
    allCities.forEach(city => {
      console.log(`   • ${city.cityName.padEnd(15)} | Gold: ₹${String(city.gold_price).padStart(5)} | Silver: ₹${String(city.silver_price).padStart(6)}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedCities();
