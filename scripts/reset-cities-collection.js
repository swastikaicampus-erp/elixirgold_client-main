/**
 * Reset Script: Drop and recreate the cities collection with new schema
 * 
 * This script removes the old cities collection and recreates it
 * with the new schema to ensure validation rules are correct.
 * 
 * Usage: node scripts/reset-cities-collection.js
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

async function resetCollection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get existing cities
    const existingCities = await City.find();
    console.log(`📊 Found ${existingCities.length} existing cities`);
    
    if (existingCities.length > 0) {
      console.log('💾 Saving city data...');
      const backup = existingCities.map(c => ({
        cityName: c.cityName,
        gold_price: c.gold_price,
        silver_price: c.silver_price,
      }));
      console.log(JSON.stringify(backup, null, 2));
    }

    // Drop the collection
    console.log('\n🗑️  Dropping cities collection...');
    await City.collection.drop();
    console.log('✅ Collection dropped\n');

    // Recreate with new indexes
    console.log('📝 Creating new collection with updated schema...');
    await City.collection.createIndex({ cityName: 1 }, { unique: true });
    console.log('✅ New collection created with proper indexes\n');

    // Re-insert existing cities if any
    if (existingCities.length > 0) {
      console.log('📥 Re-inserting saved cities...');
      const inserted = await City.insertMany(
        existingCities.map(c => ({
          cityName: c.cityName,
          gold_price: c.gold_price,
          silver_price: c.silver_price,
        }))
      );
      console.log(`✅ Re-inserted ${inserted.length} cities\n`);
      
      const all = await City.find();
      console.log('📋 Current cities:');
      all.forEach(city => {
        console.log(`   • ${city.cityName.padEnd(15)} | Gold: ₹${String(city.gold_price).padStart(5)} | Silver: ₹${String(city.silver_price).padStart(6)}`);
      });
    } else {
      console.log('ℹ️  No cities to re-insert');
    }

    await mongoose.connection.close();
    console.log('\n✅ Collection reset complete!');
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

resetCollection();
