import mongoose from 'mongoose';

// Import your user and movie models
import { User, Movie } from '../../src/models/models.js';

// Connection URI for your MongoDB database
const MONGODB_URI = 'mongodb://localhost:27017/reelDB';

async function migrateFavorites() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    // Find all users with numeric favorites and get the raw data
    const usersToUpdate = await User.find({ favorites: { $type: 16 } }).lean();

    console.log(`Found ${usersToUpdate.length} users with numeric favorites to update.`);

    for (const user of usersToUpdate) {
      // Create a temporary array to hold the new favorite references
      const newFavorites = [];

      // Loop through the existing favorites from the raw data
      // This check ensures 'favorites' is a valid array before proceeding
      if (user.favorites && Array.isArray(user.favorites)) {
        for (const favorite of user.favorites) {
          if (typeof favorite === 'number') {
            const movie = await Movie.findOne({ movieid: favorite }).select('_id');
            if (movie) {
              newFavorites.push(movie._id);
            } else {
              console.warn(`Movie with old movieid: ${favorite} not found. Skipping.`);
            }
          } else {
            newFavorites.push(favorite);
          }
        }
      } else {
        console.warn(`Skipping user ${user.username} because 'favorites' is not a valid array.`);
        continue;
      }

      // Update the user document in the database
      if (newFavorites.length > 0) {
        await User.updateOne(
          { _id: user._id },
          { $set: { favorites: newFavorites } }
        );
        console.log(`Updated user ${user.username} with new favorite references.`);
      } else {
        console.log(`No valid movies found for user ${user.username}. No update performed.`);
      }
    }

    console.log('Migration complete.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

migrateFavorites();