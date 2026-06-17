/**
 * Migration Script: Convert addonPrice to gold_price and silver_price
 * 
 * This script migrates existing City documents from the old schema
 * (with addonPrice) to the new schema (with gold_price and silver_price).
 * 
 * Usage: node scripts/migrate-prices.js
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

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all cities with addonPrice field
    const citiesWithAddonPrice = await mongoose.connection.collection('cities').find({
      addonPrice: { $exists: true },
    }).toArray();

    if (citiesWithAddonPrice.length === 0) {
      console.log('✅ No cities with addonPrice found. Database is already migrated!');
      await mongoose.connection.close();
      return;
    }

    console.log(`📊 Found ${citiesWithAddonPrice.length} cities to migrate...`);

    // Migrate each city
    for (const city of citiesWithAddonPrice) {
      console.log(`📝 Migrating: ${city.cityName}`);
      
      await City.findByIdAndUpdate(
        city._id,
        {
          gold_price: city.addonPrice || 0,
          silver_price: city.addonPrice || 0,
          $unset: { addonPrice: 1 }, // Remove the old field
        },
        { new: true, runValidators: true }
      );
      
      console.log(`   ✅ Migrated: ${city.cityName} (Gold: ${city.addonPrice}, Silver: ${city.addonPrice})`);
    }

    console.log(`\n✅ Migration complete! ${citiesWithAddonPrice.length} cities updated.`);
    
    // Show migrated data
    const allCities = await City.find();
    console.log('\n📋 Final Data:');
    allCities.forEach(city => {
      console.log(`   - ${city.cityName}: Gold=${city.gold_price}, Silver=${city.silver_price}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Migration successful!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
