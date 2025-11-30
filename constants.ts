import { BrandItem } from "./types";

export const BRAND_DATABASE: BrandItem[] = [
  {
    name: "星巴克 (Starbucks)",
    items: [
      { name: "美式咖啡 (Caffè Americano)", sizes: [{ label: "小 (Short)", mg: 75 }, { label: "中 (Tall)", mg: 150 }, { label: "大 (Grande)", mg: 225 }, { label: "特大 (Venti)", mg: 300 }] },
      { name: "那堤 (Caffè Latte)", sizes: [{ label: "小", mg: 75 }, { label: "中", mg: 75 }, { label: "大", mg: 150 }, { label: "特大", mg: 150 }] },
      { name: "冷萃咖啡 (Cold Brew)", sizes: [{ label: "中", mg: 155 }, { label: "大", mg: 205 }, { label: "特大", mg: 310 }] },
    ]
  },
  {
    name: "City Cafe (7-11)",
    items: [
      { name: "美式咖啡", sizes: [{ label: "中杯", mg: 200 }, { label: "大杯", mg: 270 }] },
      { name: "拿鐵", sizes: [{ label: "中杯", mg: 180 }, { label: "大杯", mg: 225 }] }
    ]
  },
  {
    name: "路易莎 (Louisa)",
    items: [
      { name: "美式黑咖啡", sizes: [{ label: "中 (M)", mg: 150 }, { label: "大 (L)", mg: 200 }] },
      { name: "莊園拿鐵", sizes: [{ label: "中 (M)", mg: 100 }, { label: "大 (L)", mg: 150 }] }
    ]
  },
  {
    name: "Let's Café (全家)",
    items: [
      { name: "經典美式", sizes: [{ label: "中杯", mg: 150 }, { label: "大杯", mg: 200 }, { label: "特大", mg: 270 }] },
      { name: "經典拿鐵", sizes: [{ label: "中杯", mg: 120 }, { label: "大杯", mg: 160 }, { label: "特大", mg: 200 }] }
    ]
  },
  {
    name: "能量飲料",
    items: [
      { name: "Red Bull", sizes: [{ label: "250ml", mg: 80 }, { label: "355ml", mg: 114 }] },
      { name: "Monster 魔爪", sizes: [{ label: "355ml", mg: 120 }] }
    ]
  }
];

export const DEFAULT_SETTINGS = {
  dailyLimitMg: 400,
  halfLifeHours: 5,
  bedtime: "23:00",
  wakeTime: "07:00",
  sleepThresholdMg: 50
};