const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=480&q=78&fit=crop&auto=format`;

export const INITIAL_CATEGORIES = [
  { id: "starters", name: { en: "Starters",    am: "ቀዳሚ ምግቦች"  }, order: 1 },
  { id: "main",     name: { en: "Main Dishes", am: "ዋና ምግቦች"    }, order: 2 },
  { id: "grill",    name: { en: "Grill",       am: "ጥብስ"         }, order: 3 },
  { id: "drinks",   name: { en: "Drinks",      am: "መጠጦች"        }, order: 4 },
  { id: "desserts", name: { en: "Desserts",    am: "ጣፋጭ ምግቦች"  }, order: 5 },
];

export const INITIAL_MENU = [
  { id: "mercimek",      name: { en: "Lentil Soup",         am: "ምስር ሾርባ"           }, description: { en: "Traditional red lentil soup",                   am: "ባህላዊ ቀይ ምስር ሾርባ"                   }, price: 45,  category: "starters",  image: U("1547592166-23ac45744acd"), hidden: false },
  { id: "humus",         name: { en: "Hummus",              am: "ሆሙስ"               }, description: { en: "Chickpea dip with tahini and olive oil",         am: "ከጣሂኒና ወይራ ዘይት ጋር የተዘጋጀ ሽምብራ"      }, price: 55,  category: "starters",  image: U("1585937421612-70a008356fbe"), hidden: false },
  { id: "cacik",         name: { en: "Cacık",               am: "ካጃክ"               }, description: { en: "Yogurt with cucumber and mint",                  am: "እርጎ፣ ዱባና የናናዓ ቅጠሎች"                }, price: 35,  category: "starters",  image: U("1589301760014-d929f3979dbc"), hidden: false },
  { id: "sigara-boregi", name: { en: "Cheese Rolls",        am: "ሲጋራ ቦሬዪ"          }, description: { en: "Crispy filo pastry with cheese filling",          am: "ሂበን ተሞልቶ የተጠበሰ ፓስቲ"               }, price: 65,  category: "starters",  image: U("1601314167099-232775b3d6fd"), hidden: false },
  { id: "kuzu-guvec",    name: { en: "Lamb Stew",           am: "የበግ ስቱ"            }, description: { en: "Oven-baked lamb with vegetables",                 am: "አትክልቶቻቸው ጋር ምድጃ ላይ የበሰለ የበግ ሥጋ"   }, price: 185, category: "main",      image: U("1574484284002-952d92456975"), hidden: false },
  { id: "karniyarik",    name: { en: "Stuffed Eggplant",    am: "የተሞላ ሕምባሻ"         }, description: { en: "Eggplant stuffed with minced meat",               am: "በተፈጨ ሥጋ የተሞላ ሕምባሻ"               }, price: 145, category: "main",      image: U("1621501903986-f1ffa7cc7a6c"), hidden: false },
  { id: "imam-bayildi",  name: { en: "İmam Bayıldı",        am: "ኢማም ባይልዲ"          }, description: { en: "Braised eggplant with olive oil",                 am: "በወይራ ዘይት የተዘጋጀ ሕምባሻ"               }, price: 125, category: "main",      image: U("1640539399780-c7e88e2b6f05"), hidden: false },
  { id: "manti",         name: { en: "Dumplings",           am: "ማንቲ"               }, description: { en: "Handmade dumplings with yogurt sauce",            am: "ከእርጎ ጋር የተዘጋጀ ዱምፕሊንግ"              }, price: 135, category: "main",      image: U("1559058789-672da06263d8"), hidden: false },
  { id: "adana-kebap",   name: { en: "Adana Kebab",         am: "አዳና ከባብ"           }, description: { en: "Spicy minced meat kebab with lavash",             am: "ስለቻ ሥጋ ቀቤ ኬባብ"                     }, price: 175, category: "grill",     image: U("1529193591184-b1d58069ecdd"), hidden: false },
  { id: "kofte",         name: { en: "Meatballs",           am: "ኮፍቴ"               }, description: { en: "Grilled meatballs with tomato and pepper",        am: "ቲማቲምና ፍርፍር ጋር ስለቻ ሥጋ"              }, price: 155, category: "grill",     image: U("1603360946369-dc9bb6258143"), hidden: false },
  { id: "ayran",         name: { en: "Ayran",               am: "አይራን"              }, description: { en: "Cold homemade yogurt drink",                      am: "ቀዝቃዛ ቤት ውስጥ የተሰራ እርጎ መጠጥ"         }, price: 25,  category: "drinks",    image: U("1513558161293-cdaf765ed2fd"), hidden: false },
  { id: "black-tea",     name: { en: "Black Tea",           am: "ጥቁር ሻይ"            }, description: { en: "Brewed black tea",                                am: "ጥቁር ሻይ"                            }, price: 15,  category: "drinks",    image: U("1564890369478-c89ca6d9cde9"), hidden: false },
  { id: "arabic-coffee", name: { en: "Arabic Coffee",       am: "አረቢያዊ ቡና"          }, description: { en: "Traditional Arabic coffee",                       am: "ባህላዊ አረቢያዊ ቡና"                     }, price: 35,  category: "drinks",    image: U("1514432324607-a09d9b4aefdd"), hidden: false },
  { id: "limonata",      name: { en: "Lemonade",            am: "ሎሚ ጭማቂ"            }, description: { en: "Freshly squeezed lemonade",                       am: "ትኩስ ሎሚ ጭማቂ"                       }, price: 45,  category: "drinks",    image: U("1621263764928-df1444c5e859"), hidden: false },
  { id: "baklava",       name: { en: "Baklava",             am: "ባቅላዋ"              }, description: { en: "Pistachio baklava with clotted cream",             am: "ፒስቴቺዮ ባቅላዋ ከዝናብ ቅቤ ጋር"            }, price: 85,  category: "desserts",  image: U("1519676867240-f03562e64548"), hidden: false },
  { id: "sutlac",        name: { en: "Rice Pudding",        am: "የሩዝ ብቃ"            }, description: { en: "Baked rice pudding with cinnamon",                 am: "ቅርፋፋ ጋር የምድጃ የሩዝ ብቃ"               }, price: 65,  category: "desserts",  image: U("1551024506-0bccd828d307"), hidden: false },
  { id: "kunefe",        name: { en: "Künefe",              am: "ኩነፌ"               }, description: { en: "Cheese künefe with syrup",                        am: "ሺርቤ ጋር ሂበን ኩነፌ"                    }, price: 95,  category: "desserts",  image: U("1571167530149-c1105da4c2c3"), hidden: false },
  { id: "dondurma",      name: { en: "Ice Cream",           am: "አይስ ክሬም"           }, description: { en: "Handmade ice cream",                              am: "ቤት ውስጥ የተሰራ አይስ ክሬም"               }, price: 55,  category: "desserts",  image: U("1563805042-7684c019e1cb"), hidden: false },
];
