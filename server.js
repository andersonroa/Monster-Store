require('dotenv').config();
require('express-async-errors');
const express = require('express'), cors = require('cors'), mongoose = require('mongoose'), jwt = require('jsonwebtoken');
const app = express();
app.use(cors({origin: process.env.FRONT_URL || '*'}));
app.use(express.json());

const opts = {toJSON: {versionKey: false, transform: (_, o) => { o.id = o._id; delete o._id; }}};
const created = {...opts, timestamps: {createdAt: 'created_at', updatedAt: false}};
const CATS = ['ropa', 'accesorios', 'perfumes', 'zapatos'];
const Product = mongoose.model('Product', new mongoose.Schema({name: {type: String, required: true}, category: {type: String, enum: CATS, required: true}, price: {type: Number, required: true, min: 0}, stock: {type: Number, default: 0, min: 0}, image: String, description: String, tag: {type: String, default: 'Nuevo'}}, opts));
const Msg = mongoose.model('Message', new mongoose.Schema({name: String, email: String, text: String, type: {type: String, default: 'contacto'}}, created));
const Order = mongoose.model('Order', new mongoose.Schema({customer: String, phone: String, address: String, items: [{product: mongoose.Schema.Types.ObjectId, name: String, price: Number, qty: Number}], total: Number, status: {type: String, default: 'pendiente'}}, created));

const auth = (req, res, next) => { try { jwt.verify((req.headers.authorization || '').slice(7), process.env.JWT_SECRET); next(); } catch { res.status(401).json({error: 'No autorizado'}); } };
const pick = (b, keys) => Object.fromEntries(keys.filter(k => b[k] !== undefined).map(k => [k, b[k]]));
const FIELDS = ['name', 'category', 'price', 'stock', 'image', 'description', 'tag'];

app.get('/', (_, res) => res.json({ok: true}));

// --- Catálogo ---
app.get('/api/products', async (req, res) => res.json(await Product.find(CATS.includes(req.query.category) ? {category: req.query.category} : {}).sort('_id')));
app.post('/api/products', auth, async (req, res) => res.status(201).json(await Product.create(pick(req.body, FIELDS))));
app.put('/api/products/:id', auth, async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {new: true, runValidators: true})));
app.delete('/api/products/:id', auth, async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({ok: true}); });

// --- Contacto y newsletter ---
app.post('/api/messages', async (req, res) => {
  const {name = '', email, text = '', type} = req.body;
  if (!email) return res.status(400).json({error: 'Falta el correo'});
  res.status(201).json(await Msg.create({name, email, text, type: type === 'newsletter' ? 'newsletter' : 'contacto'}));
});
app.get('/api/messages', auth, async (_, res) => res.json(await Msg.find().sort('-created_at')));

// --- Pedidos (el precio y el total los calcula el servidor, no el navegador) ---
app.post('/api/orders', async (req, res) => {
  const {customer, phone, address, items} = req.body;
  if (!customer || !phone || !address || !Array.isArray(items) || !items.length) return res.status(400).json({error: 'Faltan datos'});
  const done = [], lines = [];
  try {
    for (const it of items) {
      const qty = Math.floor(+it.qty);
      if (!(qty > 0)) throw new Error('Cantidad inválida');
      const p = await Product.findOneAndUpdate({_id: it.id, stock: {$gte: qty}}, {$inc: {stock: -qty}});
      if (!p) throw new Error('Sin stock suficiente');
      done.push([p._id, qty]); lines.push({product: p._id, name: p.name, price: p.price, qty});
    }
  } catch (e) {
    for (const [id, q] of done) await Product.updateOne({_id: id}, {$inc: {stock: q}});
    return res.status(400).json({error: e.name === 'CastError' ? 'Producto inválido' : e.message});
  }
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  res.status(201).json(await Order.create({customer, phone, address, items: lines, total}));
});
app.get('/api/orders', auth, async (_, res) => res.json(await Order.find().sort('-created_at')));
app.patch('/api/orders/:id', auth, async (req, res) => res.json(await Order.findByIdAndUpdate(req.params.id, {status: req.body.status}, {new: true})));

// --- Monster IA: recomendador de outfits según texto y presupuesto ---
const K = {ropa: ['ropa', 'camis', 'chaqueta', 'pantal', 'buso', 'hoodie'], accesorios: ['accesorio', 'cadena', 'gorra', 'reloj', 'collar'], perfumes: ['perfume', 'olor', 'fragancia'], zapatos: ['zapato', 'tenis', 'bota', 'zapatilla']};
app.post('/api/ia', async (req, res) => {
  const t = String(req.body.message || '').toLowerCase();
  if (!t) return res.status(400).json({error: 'Escribe un mensaje'});
  const m = t.match(/(\d[\d.]*)\s*(mil|k)?/);
  let budget = null;
  if (m) { let n = parseFloat(m[1].replace(/\./g, '')); if (m[2]) n *= 1000; if (n >= 1000) budget = n; }
  let cats = Object.keys(K).filter(c => K[c].some(k => t.includes(k)));
  if (!cats.length || /outfit|look|conjunto|combin/.test(t)) cats = CATS;
  const per = budget ? budget / cats.length : Infinity, words = t.split(/\W+/).filter(w => w.length > 3), picks = [];
  for (const c of cats) {
    const list = await Product.find({category: c, stock: {$gt: 0}, price: {$lte: per}});
    if (!list.length) continue;
    const score = p => words.filter(w => `${p.name} ${p.description || ''} ${p.tag || ''}`.toLowerCase().includes(w)).length;
    list.sort((a, b) => score(b) - score(a) || a.price - b.price);
    picks.push(list[0]);
  }
  const total = picks.reduce((s, p) => s + p.price, 0), cop = n => '$' + n.toLocaleString('es-CO');
  res.json({reply: picks.length ? `Te recomiendo: ${picks.map(p => p.name).join(' + ')}. Total ${cop(total)}${budget ? ` (tu presupuesto: ${cop(budget)})` : ''}.` : 'Ahora no tengo productos disponibles con ese presupuesto o categoría. Prueba con otro valor.', products: picks});
});

// --- Login del administrador ---
app.post('/api/login', (req, res) => {
  const {email, password} = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) return res.json({token: jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '8h'})});
  res.status(401).json({error: 'Credenciales inválidas'});
});
app.use((e, _req, res, _next) => { console.error(e); res.status(500).json({error: 'Error del servidor'}); });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  if (!(await Product.countDocuments())) await Product.create({name: 'Camiseta Oversize', category: 'ropa', price: 70000, stock: 10, image: 'img/productos/ropa/camisas/oversize/oversize-front.png', description: 'Camiseta oversize urbana', tag: 'Nuevo'});
  app.listen(process.env.PORT || 3000, () => console.log('API lista y conectada a MongoDB'));
}).catch(e => { console.error('Error al conectar con MongoDB:', e.message); process.exit(1); });
