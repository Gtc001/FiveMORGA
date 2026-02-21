require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const CATEGORIES = [
  { name: 'Système', color: '#6366f1', icon: 'cpu' },
  { name: 'Interface / HUD', color: '#8b5cf6', icon: 'monitor' },
  { name: 'Commerces & Services', color: '#f59e0b', icon: 'store' },
  { name: 'Véhicules & Transport', color: '#3b82f6', icon: 'car' },
  { name: 'Économie & Immobilier', color: '#10b981', icon: 'bank' },
  { name: 'Activités & Loisirs', color: '#f97316', icon: 'gamepad' },
  { name: 'Criminel & Illégal', color: '#ef4444', icon: 'skull' },
  { name: 'Idées & Divers', color: '#64748b', icon: 'lightbulb' },
];

const TASKS = {
  Système: [
    { title: 'ID unique', description: 'Système d\'identifiant unique pour chaque joueur', priority: 'high' },
    { title: 'AntiCheat', description: 'Système anti-triche pour le serveur', priority: 'critical' },
    { title: 'Zone AFK', description: 'Zone dédiée pour les joueurs AFK', priority: 'medium' },
    { title: 'Door Lock', description: 'Système de verrouillage des portes', priority: 'high' },
    { title: 'JobBuilder', description: 'Outil de création de jobs personnalisés', priority: 'high' },
    { title: 'Point GPS affiché en jeu', description: 'Points GPS visibles visuellement dans le jeu', priority: 'medium' },
    { title: 'Système de clé / double clé', description: 'Gestion des clés de véhicules et propriétés', notes: 'Idée : Menu clé dédié ?', priority: 'high' },
  ],
  'Interface / HUD': [
    { title: 'HUD', description: 'Interface HUD complète', notes: 'Détail : Afficher l\'âge du personnage dans le HUD', priority: 'critical' },
    { title: 'Notification', description: 'Système de notifications en jeu', priority: 'high' },
    { title: 'Menu F5', description: 'Menu principal accessible via F5', priority: 'critical' },
    { title: 'Menu Gang', description: 'Menu de gestion pour les gangs', priority: 'high' },
    { title: 'Menu Admin', description: 'Menu d\'administration du serveur', priority: 'critical' },
    { title: 'Menu Animation', description: 'Menu d\'animations pour les joueurs', notes: 'Avec live preview des animations', priority: 'medium' },
    { title: 'Inventaire', description: 'Système d\'inventaire complet', notes: 'Avec gestion des vêtements intégrée', priority: 'critical' },
    { title: 'Créateur de personnage', description: 'Création et personnalisation de personnage', priority: 'critical' },
    { title: 'Lb-Phone', description: 'Intégration du téléphone LB-Phone', priority: 'high' },
    { title: 'Echap = Carte props', description: 'Touche Échap ouvre une carte en props', priority: 'low' },
  ],
  'Commerces & Services': [
    { title: 'Magasin de vêtement', description: 'Boutique de vêtements pour personnages', priority: 'high' },
    { title: 'Amunnation', description: 'Magasin d\'armes Ammu-Nation', priority: 'high' },
    { title: 'Pompe à essence', description: 'Stations-service fonctionnelles', priority: 'high' },
    { title: 'LTD', description: 'Magasins de proximité LTD', priority: 'medium' },
    { title: 'Barber Shop / Tattoo Shop', description: 'Salons de coiffure et tatouage', priority: 'medium' },
  ],
  'Véhicules & Transport': [
    { title: 'Garage voiture / Aérien + Fourrière x2', description: 'Garages véhicules terrestres et aériens avec double fourrière', priority: 'critical' },
    { title: 'Location véhicules', description: 'Service de location de véhicules', notes: 'Scooter, voiture, jet-ski, bateaux', priority: 'high' },
    { title: 'Vente véhicule occasion', description: 'Système de vente de véhicules d\'occasion entre joueurs', priority: 'medium' },
    { title: 'Auto-école', description: 'Auto-école avec passage du permis de conduire', notes: 'Idée : Voir le circuit affiché sur la map', priority: 'medium' },
    { title: 'Metro', description: 'Système de métro fonctionnel', notes: 'Style wise très sympa – soigner le design', priority: 'low' },
  ],
  'Économie & Immobilier': [
    { title: 'Banque', description: 'Système bancaire complet (dépôt, retrait, transfert)', priority: 'critical' },
    { title: 'Loterie', description: 'Système de loterie pour les joueurs', priority: 'low' },
    { title: 'Immobilier', description: 'Achat et vente de propriétés immobilières', priority: 'high' },
  ],
  'Activités & Loisirs': [
    { title: 'Bowling', description: 'Activité bowling jouable', priority: 'low' },
    { title: 'Casino', description: 'Casino avec jeux d\'argent', priority: 'medium' },
    { title: 'Golf', description: 'Activité golf', notes: 'Utiliser rcore_golf', priority: 'low' },
    { title: 'LunaPark', description: 'Activité parc d\'attractions LunaPark', priority: 'low' },
    { title: 'Bras de fer', description: 'Activité bras de fer entre joueurs', priority: 'low' },
    { title: 'Karting', description: 'Activité course de karts', priority: 'low' },
    { title: 'Saut en parachute', description: 'Activité saut en parachute', priority: 'low' },
    { title: 'Laser Game', description: 'Activité laser game', priority: 'low' },
    { title: 'Chasse', description: 'Activité de chasse', priority: 'medium' },
    { title: 'Pêche', description: 'Activité de pêche', priority: 'medium' },
  ],
  'Criminel & Illégal': [
    { title: 'PNJ vente illégale', description: 'PNJ de vente illégale style Lester dans sa maison', notes: 'Idée : Menu simple ou menu avec dialogue', priority: 'high' },
    { title: 'Braquage bijouterie', description: 'Scénario de braquage de bijouterie', priority: 'high' },
    { title: 'Braquage superette / banque', description: 'Scénarios de braquage de supérettes et banques', priority: 'high' },
    { title: 'Cambriolage', description: 'Système de cambriolage de maisons', notes: 'Pas besoin de lockpick', priority: 'medium' },
  ],
  'Idées & Divers': [
    { title: 'Arme dans le dos', description: 'Affichage visuel des armes dans le dos du personnage', priority: 'medium' },
    { title: 'Moteur calé après PIT', description: 'Le véhicule a du mal à redémarrer après un PIT', notes: 'Notification : le moteur du véhicule a calé', priority: 'low' },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const hash = await bcrypt.hash('admin', 10);
    const userResult = await client.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password_hash = $2, role = $3 RETURNING id',
      ['admin', hash, 'admin']
    );
    const userId = userResult.rows[0].id;

    await client.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM categories WHERE user_id = $1', [userId]);

    const categoryMap = {};
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const result = await client.query(
        'INSERT INTO categories (name, color, icon, position, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [cat.name, cat.color, cat.icon, i, userId]
      );
      categoryMap[cat.name] = result.rows[0].id;
    }

    let position = 0;
    for (const [categoryName, tasks] of Object.entries(TASKS)) {
      const categoryId = categoryMap[categoryName];
      for (const task of tasks) {
        await client.query(
          `INSERT INTO tasks (title, description, notes, status, priority, category_id, user_id, position)
           VALUES ($1, $2, $3, 'todo', $4, $5, $6, $7)`,
          [task.title, task.description, task.notes || null, task.priority, categoryId, userId, position++]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`[Seed] Created user "admin" (password: "admin")`);
    console.log(`[Seed] Created ${CATEGORIES.length} categories`);
    console.log(`[Seed] Created ${position} tasks`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
