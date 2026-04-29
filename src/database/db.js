import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'flowcash.db';
const database_version = '1.0';
const database_displayname = 'FlowCash Database';
const database_size = 200000;

let db;

export const initDB = async () => {
  if (db) return db;
  try {
    db = await SQLite.openDatabase({name: database_name, location: 'default'});
    await db.executeSql(`PRAGMA foreign_keys = ON;`);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        icon TEXT,
        created_at DATETIME
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL,
        category_id INTEGER,
        note TEXT,
        date DATETIME,
        created_at DATETIME,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    return db;
  } catch (err) {
    console.error('DB init error', err);
    throw err;
  }
};

export const closeDB = async () => {
  if (db) {
    await db.close();
    db = null;
  }
};

export const seedDefaultCategories = async () => {
  const defaults = [
    {name: 'Food', icon: 'food'},
    {name: 'Travel', icon: 'plane'},
    {name: 'Shopping', icon: 'shopping-bag'},
    {name: 'Bills', icon: 'file-invoice-dollar'},
    {name: 'Health', icon: 'heart'},
    {name: 'Others', icon: 'ellipsis-h'},
  ];
  try {
    const db = await initDB();
    const [res] = await db.executeSql('SELECT COUNT(*) as cnt FROM categories');
    const cnt = res.rows.item(0).cnt;
    if (cnt === 0) {
      const now = new Date().toISOString();
      await db.transaction(tx => {
        defaults.forEach(cat => {
          tx.executeSql('INSERT INTO categories (name, icon, created_at) VALUES (?, ?, ?)', [cat.name, cat.icon, now]);
        });
      });
    }
  } catch (err) {
    console.error('Seeding categories failed', err);
  }
};

export const addExpense = async ({amount, category_id, note, date}) => {
  try {
    const db = await initDB();
    const now = new Date().toISOString();
    const [res] = await db.executeSql(
      'INSERT INTO expenses (amount, category_id, note, date, created_at) VALUES (?, ?, ?, ?, ?)',
      [amount, category_id, note || '', date || now, now]
    );
    return res.insertId;
  } catch (err) {
    console.error('Add expense error', err);
    throw err;
  }
};

export const getCategories = async () => {
  try {
    const db = await initDB();
    const [res] = await db.executeSql('SELECT * FROM categories ORDER BY name');
    const cats = [];
    for (let i = 0; i < res.rows.length; i++) cats.push(res.rows.item(i));
    return cats;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getExpenses = async (filter = {}) => {
  try {
    const db = await initDB();
    let where = '';
    const params = [];
    if (filter.category_id) {
      where += ' AND category_id = ?';
      params.push(filter.category_id);
    }
    if (filter.from) {
      where += ' AND date >= ?';
      params.push(filter.from);
    }
    if (filter.to) {
      where += ' AND date <= ?';
      params.push(filter.to);
    }
    const sql = `SELECT e.*, c.name as category_name, c.icon as category_icon FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE 1=1 ${where} ORDER BY date DESC, created_at DESC`;
    const [res] = await db.executeSql(sql, params);
    const rows = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getTotals = async () => {
  try {
    const db = await initDB();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const [tRes] = await db.executeSql('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE date >= ?', [startOfToday]);
    const [wRes] = await db.executeSql('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE date >= ?', [startOfWeek]);
    const [mRes] = await db.executeSql('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE date >= ?', [startOfMonth]);

    return {
      today: tRes.rows.item(0).total || 0,
      week: wRes.rows.item(0).total || 0,
      month: mRes.rows.item(0).total || 0,
    };
  } catch (err) {
    console.error(err);
    return {today: 0, week: 0, month: 0};
  }
};

export const updateCategory = async (id, {name, icon}) => {
  try {
    const db = await initDB();
    await db.executeSql('UPDATE categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id]);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const deleteCategory = async (id) => {
  try {
    const db = await initDB();
    await db.executeSql('DELETE FROM categories WHERE id = ?', [id]);
    // Set expenses category to NULL already covered by FK ON DELETE SET NULL
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const exportExpensesCSV = async () => {
  try {
    const db = await initDB();
    const [res] = await db.executeSql('SELECT e.id, e.amount, e.date, e.note, c.name as category FROM expenses e LEFT JOIN categories c ON e.category_id = c.id ORDER BY e.date DESC');
    const rows = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
    const header = ['id','amount','date','note','category'];
    const csv = [header.join(',')].concat(rows.map(r => [r.id, r.amount, `"${r.date}"`, `"${(r.note||'').replace(/"/g,'""')}"`, `"${(r.category||'').replace(/"/g,'""')}"`].join(','))).join('\n');
    return csv;
  } catch (err) {
    console.error(err);
    return '';
  }
};

export const getCategoryTotals = async () => {
  try {
    const db = await initDB();
    const [res] = await db.executeSql('SELECT c.name as category, IFNULL(SUM(e.amount),0) as total FROM categories c LEFT JOIN expenses e ON e.category_id = c.id GROUP BY c.id ORDER BY total DESC');
    const out = [];
    for (let i=0;i<res.rows.length;i++) out.push(res.rows.item(i));
    return out;
  } catch (err) {console.error(err); return []}
};

export const getWeeklyTotals = async () => {
  try {
    const db = await initDB();
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const [res] = await db.executeSql('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE date LIKE ?', [key+'%']);
      labels.push(d.toDateString().slice(0,3));
      data.push(res.rows.item(0).total || 0);
    }
    return {labels, data};
  } catch (err) {console.error(err); return {labels:[], data:[]}};
};

export const getHighestSpendingDay = async () => {
  try {
    const db = await initDB();
    const [res] = await db.executeSql("SELECT date(date) as day, SUM(amount) as total FROM expenses GROUP BY date(date) ORDER BY total DESC LIMIT 1");
    if (res.rows.length>0) return res.rows.item(0);
    return null;
  } catch (err) {console.error(err); return null}
};

export const getSpendingComparison = async () => {
  try {
    const db = await initDB();
    const now = new Date();
    const startThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()-6).toISOString();
    const startLastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()-13).toISOString();
    const [thisRes] = await db.executeSql('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE date >= ?', [startThisWeek]);
    const [lastRes] = await db.executeSql('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE date >= ? AND date < ?', [startLastWeek, startThisWeek]);
    const thisTotal = thisRes.rows.item(0).total || 0;
    const lastTotal = lastRes.rows.item(0).total || 0;
    const diff = thisTotal - lastTotal;
    const percent = lastTotal === 0 ? (thisTotal>0?100:0) : (diff/lastTotal)*100;
    return {thisTotal, lastTotal, diff, percent};
  } catch (err) {console.error(err); return {thisTotal:0,lastTotal:0,diff:0,percent:0}};
};
