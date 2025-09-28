/**
 * MongoDB Cleanup Script (Node.js)
 * * This script connects to the MongoDB database and deletes all documents
 * from the 'User' collection except for the one with the specified ObjectID.
 *
 * Requirements:
 * - Node.js
 * - The 'mongoose' package installed (npm install mongoose)
 * - The 'User' model imported or defined (assumes the structure from models.js)
 */

import mongoose from 'mongoose';
// Import 'User' model (from the attached models.js)
import { User } from '../models.js'; 

// --- Configuration ---
// !!! IMPORTANT: REPLACE THIS WITH YOUR ACTUAL MONGODB CONNECTION STRING !!!
const MONGODB_URI = 'mongodb://localhost:27017/reelDB'; 

// The ObjectID of the single user you want to keep
const ID_TO_KEEP = '68d8c58072e6143f2abf7cdb';


/**
 * Main function to execute the cleanup operation.
 */
async function cleanupDatabase() {
    console.log('--- MongoDB User Cleanup Started ---');

    try {
        // 1. Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Successfully connected to MongoDB.');

        // 2. Prepare the query: Find documents where _id is NOT equal ($ne) to the ID to keep
        // This is the core logic: { _id: { $ne: 'ID_TO_KEEP' } }
        const deleteQuery = {
            _id: { $ne: ID_TO_KEEP }
        };

        console.log(`Searching for users to delete (excluding ID: ${ID_TO_KEEP})...`);

        // 3. Execute the deletion on the User model
        const result = await User.deleteMany(deleteQuery);

        // 4. Report results
        if (result.deletedCount > 0) {
            console.log(`\n🎉 User Cleanup Complete!`);
            console.log(`Deleted ${result.deletedCount} user documents.`);
            console.log(`The user with ID '${ID_TO_KEEP}' remains.`);
        } else {
            console.log('\nNothing to delete. All other user documents may have already been removed.');
        }

    } catch (error) {
        console.error('\n❌ An error occurred during cleanup:', error.message);
        // Log the full error for debugging
        // console.error(error); 
    } finally {
        // 5. Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\n🔗 Connection to MongoDB closed.');
        console.log('--- MongoDB User Cleanup Finished ---');
    }
}

// Execute the function
cleanupDatabase();