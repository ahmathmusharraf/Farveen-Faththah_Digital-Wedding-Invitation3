import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { wishes, rsvps } from './src/db/schema.ts';
import { eq, desc, sql } from 'drizzle-orm';

const app = express();
const PORT = 3000;

app.use(express.json());

const initialWishes = [
  {
    id: '1',
    name: 'Uncle Fawzy & Aunt Sameera',
    message: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ. What a beautiful couple! We are so overjoyed to hear this news. Sending our sincere du\'as all the way from Muscat.',
    category: 'Dua',
    likes: 12,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2',
    name: 'The Fawser Family',
    message: 'Under Allah\'s divine guidance, two beautiful souls unite. A lifetime of tranquility, affection, and infinite barakah lies ahead for our dear daughter Farveen & Faththah. Alhamdulillah!',
    category: 'Blessing',
    likes: 18,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: '3',
    name: 'Brother Salman & Sarah',
    message: 'Mabrook to the golden couple! May Allah grant you both righteous offspring, deep affection, and high ranks in Jannah together. Ameen!',
    category: 'Congratulations',
    likes: 9,
    createdAt: Date.now() - 20 * 60 * 60 * 1000,
  }
];

// API REST routes
// 1. Wishes (Guestbook Duas)
app.get('/api/wishes', async (req, res) => {
  try {
    let result = await db.select().from(wishes).orderBy(desc(wishes.createdAt));
    if (result.length === 0) {
      // Seed initial wishes if empty
      for (const wish of initialWishes) {
        await db.insert(wishes).values({
          id: wish.id,
          name: wish.name,
          message: wish.message,
          category: wish.category,
          likes: wish.likes,
          createdAt: wish.createdAt,
        }).onConflictDoNothing();
      }
      result = await db.select().from(wishes).orderBy(desc(wishes.createdAt));
    }
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching wishes from SQL:', error);
    res.status(500).json({ error: 'Database query failed. Please try again later.' });
  }
});

app.post('/api/wishes', async (req, res) => {
  try {
    const { id, name, message, category, likes, createdAt } = req.body;
    if (!id || !name || !message || !category) {
      return res.status(400).json({ error: 'Missing required wishlist fields.' });
    }
    const newWish = {
      id,
      name,
      message,
      category,
      likes: typeof likes === 'number' ? likes : 0,
      createdAt: typeof createdAt === 'number' ? createdAt : Date.now(),
    };
    await db.insert(wishes).values(newWish).onConflictDoUpdate({
      target: wishes.id,
      set: {
        name,
        message,
        category,
        likes: typeof likes === 'number' ? likes : 0,
      }
    });
    res.status(201).json(newWish);
  } catch (error: any) {
    console.error('Error adding wish to SQL:', error);
    res.status(500).json({ error: 'Database write failed. Please try again later.' });
  }
});

app.post('/api/wishes/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    await db.update(wishes)
      .set({ likes: sql`${wishes.likes} + 1` })
      .where(eq(wishes.id, id));
    
    const updated = await db.select().from(wishes).where(eq(wishes.id, id));
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Wish not found' });
    }
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error liking wish in SQL:', error);
    res.status(500).json({ error: 'Database write failed. Please try again later.' });
  }
});

// 2. RSVPs
app.get('/api/rsvps', async (req, res) => {
  try {
    const result = await db.select().from(rsvps).orderBy(desc(rsvps.createdAt));
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching RSVPs from SQL:', error);
    res.status(500).json({ error: 'Database query failed. Please try again later.' });
  }
});

app.post('/api/rsvps', async (req, res) => {
  try {
    const { id, name, attending, guestsCount, dietaryRequirements, message, whatsappContact, needsParking, parkingSpaces, createdAt } = req.body;
    if (!id || !name || typeof attending !== 'boolean') {
      return res.status(400).json({ error: 'Missing required RSVP fields.' });
    }
    const newRsvp = {
      id,
      name,
      attending,
      guestsCount: typeof guestsCount === 'number' ? guestsCount : 0,
      dietaryRequirements: dietaryRequirements || '',
      message: message || '',
      whatsappContact: whatsappContact || '',
      needsParking: !!needsParking,
      parkingSpaces: typeof parkingSpaces === 'number' ? parkingSpaces : 0,
      createdAt: typeof createdAt === 'number' ? createdAt : Date.now(),
    };
    await db.insert(rsvps).values(newRsvp).onConflictDoUpdate({
      target: rsvps.id,
      set: {
        name,
        attending,
        guestsCount: newRsvp.guestsCount,
        dietaryRequirements: newRsvp.dietaryRequirements,
        message: newRsvp.message,
        whatsappContact: newRsvp.whatsappContact,
        needsParking: newRsvp.needsParking,
        parkingSpaces: newRsvp.parkingSpaces,
      }
    });
    res.status(201).json(newRsvp);
  } catch (error: any) {
    console.error('Error adding RSVP to SQL:', error);
    res.status(500).json({ error: 'Database write failed. Please try again later.' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
