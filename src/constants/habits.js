export const HABITS = [
  // Health
  { id: 'h1', category: 'Health', icon: '💧', label: 'Drink Water', description: '8 glasses of water today' },
  { id: 'h2', category: 'Health', icon: '🥗', label: 'Eat Healthy', description: 'Nutritious meals, avoid junk food' },
  { id: 'h3', category: 'Health', icon: '😴', label: 'Quality Sleep', description: '7–9 hours of restful sleep' },
  // Fitness
  { id: 'h4', category: 'Fitness', icon: '🏃', label: 'Exercise', description: '30 min of physical activity' },
  { id: 'h5', category: 'Fitness', icon: '🧘', label: 'Stretch / Yoga', description: '10 min flexibility work' },
  { id: 'h6', category: 'Fitness', icon: '🚶', label: 'Walk 5K Steps', description: 'At least 5,000 steps daily' },
  // Growth
  { id: 'h7', category: 'Growth', icon: '📖', label: 'Read 20 Pages', description: 'Read a book or article' },
  { id: 'h8', category: 'Growth', icon: '🧠', label: 'Learn Something', description: 'Study or take a course' },
  { id: 'h9', category: 'Growth', icon: '✍️', label: 'Journal', description: 'Write thoughts or gratitude' },
  // Care
  { id: 'h10', category: 'Care', icon: '🧴', label: 'Skin Care', description: 'Morning & evening routine' },
  { id: 'h11', category: 'Care', icon: '🧹', label: 'Tidy Space', description: 'Keep your environment clean' },
  { id: 'h12', category: 'Care', icon: '📵', label: 'Screen Detox', description: '30 min no screens before bed' },
];

export const CATEGORIES = ['Health', 'Fitness', 'Growth', 'Care'];

export const CATEGORY_COLORS = {
  Health: '#4A9EFF',
  Fitness: '#C8F535',
  Growth: '#9B6DFF',
  Care: '#FF8C42',
};

export const SUGGESTIONS = [
  {
    group: 'Skin Care',
    icon: '🧴',
    items: [
      'Double Cleansing Method for oily skin',
      'SPF 50+ sunscreen daily application',
      'Vitamin C serum for brightening',
      'Retinol introduction for anti-aging',
      'Niacinamide for pore reduction',
      'Hyaluronic acid hydration layering',
    ],
  },
  {
    group: 'Snoring Solutions',
    icon: '😴',
    items: [
      'Positional therapy: sleep on side',
      'Nasal strips for nasal congestion',
      'Anti-snoring mouthguards overview',
      'CPAP therapy for sleep apnea',
      'Weight loss effect on snoring',
      'Humidifier use for dry air passages',
    ],
  },
  {
    group: 'Coding Topics',
    icon: '💻',
    items: [
      'React Server Components deep dive',
      'TypeScript advanced generics patterns',
      'System design: scaling to 1M users',
      'WebAssembly for performance-critical apps',
      'Edge computing with Cloudflare Workers',
      'AI-assisted code review strategies',
    ],
  },
  {
    group: 'Stock Knowledge',
    icon: '📈',
    items: [
      'Dollar-cost averaging strategy',
      'P/E ratio interpretation guide',
      'ETF vs mutual fund comparison',
      'Options trading: covered calls',
      'Dividend reinvestment plans (DRIP)',
      'Macroeconomic indicators for investors',
    ],
  },
];
