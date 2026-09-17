import bcrypt from 'bcryptjs';
import { IUser } from '../models/User.ts';
import { IProduct } from '../models/Product.ts';
import { ICategory } from '../models/Category.ts';
import { ICart, ICartItem } from '../models/Cart.ts';
import { IWishlist } from '../models/Wishlist.ts';
import { IOrder, ISellerPackage } from '../models/Order.ts';
import { IReview } from '../models/Review.ts';
import { ISeller } from '../models/Seller.ts';
import { ICoupon } from '../models/Coupon.ts';

class DatabaseStore {
  public users: IUser[] = [];
  public sellers: ISeller[] = [];
  public products: IProduct[] = [];
  public categories: ICategory[] = [];
  public coupons: ICoupon[] = [];
  public carts: Map<string, ICart> = new Map();
  public wishlists: Map<string, IWishlist> = new Map();
  public orders: IOrder[] = [];
  public reviews: IReview[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Verified Marketplace Sellers
    this.sellers = [
      {
        _id: 'seller-zenvy',
        storeName: 'Zenvy Official Flagship',
        slug: 'zenvy-official',
        logo: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=200&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
        description: 'The primary atelier and design house of Zenvy Wear. Contemporary menswear, designer womenswear, and bespoke craftsmanship.',
        category: 'Fashion & Luxury',
        phone: '+8801711002233',
        email: 'flagship@zenvywear.com',
        address: 'Road 11, Block D, Banani, Dhaka-1213',
        status: 'approved',
        rating: 4.9,
        numReviews: 148,
        joinedDate: new Date('2024-01-10'),
        isOfficialStore: true,
        tradeLicense: 'TRAD/DNCC/024881/2023',
        shippingFee: 80,
        returnRate: '99.4%',
        responseRate: '99%',
        totalSales: 485000
      },
      {
        _id: 'seller-techpulse',
        storeName: 'TechPulse Innovations BD',
        slug: 'techpulse-bd',
        logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=200&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
        description: 'Authorized importer of high-end computing components, audio gear, ultra-portable gadgets, and premium smart devices.',
        category: 'Electronics & Computers',
        phone: '+8801722889900',
        email: 'care@techpulsebd.com',
        address: 'Multiplan Center, Level 8, Elephant Road, Dhaka',
        status: 'approved',
        rating: 4.8,
        numReviews: 112,
        joinedDate: new Date('2024-03-15'),
        isOfficialStore: false,
        tradeLicense: 'TRAD/DSCC/011922/2023',
        shippingFee: 80,
        returnRate: '98.5%',
        responseRate: '97%',
        totalSales: 392000
      },
      {
        _id: 'seller-apex',
        storeName: 'Apex Living & Home',
        slug: 'apex-living',
        logo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=200&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
        description: 'Curated modern furniture, minimalist Scandinavian home accents, smart kitchen appliances, and luxury beddings.',
        category: 'Home & Kitchen',
        phone: '+8801833445566',
        email: 'sales@apexliving.com.bd',
        address: 'Gulshan Avenue, Circle 2, Dhaka-1212',
        status: 'approved',
        rating: 4.7,
        numReviews: 89,
        joinedDate: new Date('2024-05-01'),
        isOfficialStore: false,
        tradeLicense: 'TRAD/DNCC/087114/2024',
        shippingFee: 100,
        returnRate: '97.8%',
        responseRate: '96%',
        totalSales: 284000
      },
      {
        _id: 'seller-progear',
        storeName: 'ProGear & Automotives BD',
        slug: 'progear-bd',
        logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=200&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
        description: 'Professional sports gear, ergonomic fitness solutions, precision automotive accessories, and industrial tools.',
        category: 'Sports, Auto & Hardware',
        phone: '+8801944556677',
        email: 'contact@progear.com.bd',
        address: 'Sector 11, Uttara Commercial Zone, Dhaka-1230',
        status: 'approved',
        rating: 4.9,
        numReviews: 74,
        joinedDate: new Date('2024-07-20'),
        isOfficialStore: false,
        tradeLicense: 'TRAD/DNCC/094321/2024',
        shippingFee: 80,
        returnRate: '99.1%',
        responseRate: '99%',
        totalSales: 215000
      },
      {
        _id: 'seller-gourmet',
        storeName: 'The Royal Pantry & Care',
        slug: 'royal-pantry',
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?q=80&w=1200&auto=format&fit=crop',
        description: 'Certified organic honey, single-estate Darjeeling and Sylhet teas, gourmet pantry essentials, natural skincare & personal care.',
        category: 'Grocery & Beauty',
        phone: '+8801655667788',
        email: 'hello@royalpantry.com',
        address: 'Dhanmondi Road 27, Dhaka-1209',
        status: 'approved',
        rating: 4.8,
        numReviews: 96,
        joinedDate: new Date('2024-08-10'),
        isOfficialStore: false,
        tradeLicense: 'TRAD/DSCC/032119/2024',
        shippingFee: 60,
        returnRate: '99.5%',
        responseRate: '98%',
        totalSales: 178000
      }
    ];

    // 2. Seed All 17 Explicit Product Categories
    this.categories = [
      {
        _id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'High-definition 4K smart TVs, spatial audio headphones, professional mirrorless cameras, and studio home audio.',
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-tv',
        subcategories: ['Smart TVs', 'Audio & Headphones', 'Cameras & Video', 'Home Audio & Soundbars'],
        itemCount: 14
      },
      {
        _id: 'cat-2',
        name: 'Mobile & Accessories',
        slug: 'mobile-accessories',
        description: 'Flagship smartphones, titanium smartwatches, fast GaN wall chargers, MagSafe mounts, and armored cases.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-mobile-alt',
        subcategories: ['Smartphones', 'Smartwatches', 'Chargers & Power', 'Cases & Screen Protectors'],
        itemCount: 18
      },
      {
        _id: 'cat-3',
        name: 'Computers & Laptops',
        slug: 'computers-laptops',
        description: 'Slimline ultrabooks, powerful creator workstations, ultra-wide 4K monitors, and mechanical keyboards.',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-laptop',
        subcategories: ['Laptops & Ultrabooks', 'Desktop Monitors', 'Keyboards & Mice', 'External Storage & Hubs'],
        itemCount: 12
      },
      {
        _id: 'cat-4',
        name: "Men's Fashion",
        slug: 'mens-fashion',
        description: 'Heavyweight organic cotton tees, tailored linen shirts, raw selvedge denim, and structured outerwear.',
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-user-tie',
        subcategories: ['Shirts', 'T-Shirts & Polos', 'Denim & Pants', 'Hoodies & Jackets', 'Suits & Blazers'],
        itemCount: 22
      },
      {
        _id: 'cat-5',
        name: "Women's Fashion",
        slug: 'womens-fashion',
        description: 'Refined contemporary dresses, relaxed tailored blazers, luxury cotton kurtis, and designer essentials.',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-female',
        subcategories: ['Dresses', 'Blouses & Tops', 'Tailored Trousers', 'Kurtis & Fusion Wear', 'Outerwear'],
        itemCount: 19
      },
      {
        _id: 'cat-6',
        name: 'Kids & Baby',
        slug: 'kids-baby',
        description: 'Soft organic baby apparel, certified non-toxic Montessori toys, ergonomic strollers, and footwear.',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-baby',
        subcategories: ['Baby Clothes', 'Toddler Fashion', 'Educational Toys', 'Strollers & Gear'],
        itemCount: 9
      },
      {
        _id: 'cat-7',
        name: 'Shoes & Bags',
        slug: 'shoes-bags',
        description: 'Hand-burnished leather Chelsea boots, cushioned everyday sneakers, waxed canvas weekenders, and backpacks.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-shoe-prints',
        subcategories: ['Leather Boots', 'Sneakers', 'Travel Totes', 'Formal Dress Shoes', 'Backpacks'],
        itemCount: 15
      },
      {
        _id: 'cat-8',
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        description: 'Clean botanical serums, artisanal fragrances, sulfate-free haircare, and precision grooming kits.',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-spa',
        subcategories: ['Face Serums & Moisturizers', 'Luxury Fragrances', 'Hair Care', 'Men Grooming'],
        itemCount: 11
      },
      {
        _id: 'cat-9',
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Architectural lamps, minimalist solid oak accent tables, 400TC Egyptian cotton sheets, and wall art.',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-couch',
        subcategories: ['Modern Furniture', 'Bedding & Linen', 'Designer Lighting', 'Home Fragrance & Decor'],
        itemCount: 14
      },
      {
        _id: 'cat-10',
        name: 'Kitchen & Appliances',
        slug: 'kitchen-appliances',
        description: 'Digital air fryers, dual-boiler Italian espresso machines, multi-ply stainless cookware, and silent blenders.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-blender',
        subcategories: ['Espresso Machines', 'Air Fryers & Ovens', 'Cookware Sets', 'Food Processors'],
        itemCount: 13
      },
      {
        _id: 'cat-11',
        name: 'Grocery',
        slug: 'grocery',
        description: 'Single-estate loose leaf black tea, wild sundarbans honey, California almonds, and premium organic pantry staples.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-apple-alt',
        subcategories: ['Organic Teas', 'Raw Honey', 'Nuts & Dried Fruits', 'Extra Virgin Olive Oil'],
        itemCount: 10
      },
      {
        _id: 'cat-12',
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
        description: 'High-density alignment yoga mats, adjustable cast iron dumbbells, moisture-wicking activewear, and speed ropes.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-dumbbell',
        subcategories: ['Gym Equipment', 'Yoga & Pilates', 'Athletic Wear', 'Recovery & Foam Rollers'],
        itemCount: 12
      },
      {
        _id: 'cat-13',
        name: 'Automotive',
        slug: 'automotive',
        description: '4K dual-channel dash cameras, ceramic paint sealants, emergency digital tire inflators, and leather seat care.',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-car',
        subcategories: ['Dash Cameras', 'Car Detailing & Wash', 'Tire Inflators', 'Interior Accessories'],
        itemCount: 8
      },
      {
        _id: 'cat-14',
        name: 'Books & Stationery',
        slug: 'books-stationery',
        description: 'Architectural hardcover monographs, Japanese brass fountain pens, 160 GSM dotted journals, and desk pads.',
        image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-book-open',
        subcategories: ['Hardcover Books', 'Fine Fountain Pens', 'Leather Notebooks', 'Desk Organizers'],
        itemCount: 10
      },
      {
        _id: 'cat-15',
        name: 'Jewelry & Accessories',
        slug: 'jewelry-accessories',
        description: 'Sapphire crystal chronograph watches, 925 sterling silver bands, polarized acetate sunglasses, and cufflinks.',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-gem',
        subcategories: ['Watches', 'Sterling Silver Jewelry', 'Sunglasses', 'Cufflinks & Wallets'],
        itemCount: 14
      },
      {
        _id: 'cat-16',
        name: 'Gadgets',
        slug: 'gadgets',
        description: '4K GPS foldable mini drones, biometric smart rings, active noise cancelling earbuds, and 25000mAh laptop power banks.',
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-robot',
        subcategories: ['Drones & Gimbal', 'Smart Rings & Wearables', 'True Wireless Earbuds', 'Power Banks'],
        itemCount: 16
      },
      {
        _id: 'cat-17',
        name: 'Industrial Products',
        slug: 'industrial-products',
        description: 'Digital 100m laser distance measurers, brushless cordless drill sets, ANSI rated eye protection, and magnetic work lights.',
        image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=800&auto=format&fit=crop',
        icon: 'fa-industry',
        subcategories: ['Measuring Tools', 'Power Tools', 'Safety & Protective Gear', 'Workshop Equipment'],
        itemCount: 9
      }
    ];

    // 3. Seed Users
    const salt = bcrypt.genSaltSync(10);
    this.users = [
      {
        _id: 'usr-admin-01',
        name: 'Zenvy Marketplace Director',
        email: 'admin@zenvywear.com',
        phone: '+8801711002233',
        password: bcrypt.hashSync('admin123456', salt),
        role: 'admin',
        isBlocked: false,
        addresses: [
          {
            label: 'Headquarters',
            fullName: 'Zenvy Marketplace HQ',
            phone: '+8801711002233',
            address: 'House 42, Road 11, Block D, Banani',
            city: 'Dhaka',
            area: 'Banani',
            postalCode: '1213',
            isDefault: true
          }
        ],
        createdAt: new Date('2025-01-01')
      },
      {
        _id: 'usr-seller-01',
        name: 'Tanvir Hossain',
        email: 'seller@zenvywear.com',
        phone: '+8801722889900',
        password: bcrypt.hashSync('seller123', salt),
        role: 'seller',
        sellerId: 'seller-techpulse',
        isBlocked: false,
        addresses: [
          {
            label: 'Store Warehouse',
            fullName: 'TechPulse Warehouse',
            phone: '+8801722889900',
            address: 'Multiplan Center, Level 8, Elephant Road',
            city: 'Dhaka',
            area: 'New Market',
            postalCode: '1205',
            isDefault: true
          }
        ],
        createdAt: new Date('2025-01-10')
      },
      {
        _id: 'usr-cust-01',
        name: 'Masum Parvej',
        email: 'customer@zenvywear.com',
        phone: '+8801822334455',
        password: bcrypt.hashSync('customer123', salt),
        role: 'user',
        isBlocked: false,
        addresses: [
          {
            label: 'Home',
            fullName: 'Masum Parvej',
            phone: '+8801822334455',
            address: 'Flat 4B, Green Garden Tower, Sector 4, Uttara',
            city: 'Dhaka',
            area: 'Uttara',
            postalCode: '1230',
            isDefault: true
          }
        ],
        createdAt: new Date('2025-01-15')
      }
    ];

    // 4. Seed Active Coupons
    this.coupons = [
      {
        code: 'ZENVY10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 0,
        description: '10% off your entire order across all marketplace categories',
        expiresAt: new Date('2026-12-31'),
        isActive: true
      },
      {
        code: 'MARKET500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 3000,
        description: '৳ 500 flat discount on orders over ৳ 3,000',
        expiresAt: new Date('2026-12-31'),
        isActive: true
      },
      {
        code: 'FREESHIP',
        discountType: 'shipping',
        discountValue: 100,
        minOrderAmount: 1500,
        description: 'Free doorstep shipping on orders above ৳ 1,500',
        expiresAt: new Date('2026-12-31'),
        isActive: true
      },
      {
        code: 'FLASH20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 2500,
        description: 'Extra 20% discount on electronics and gadget flash deals',
        expiresAt: new Date('2026-12-31'),
        isActive: true
      }
    ];

    // 5. Seed Multi-Category Products
    this.products = [
      // --- Electronics ---
      {
        _id: 'prod-elec-01',
        name: 'AcousticPro Studio 4 Wireless ANC Headphones',
        slug: 'acousticpro-studio-4-wireless-anc-headphones',
        description: 'Equipped with custom 40mm beryllium drivers, dual-feedforward active noise cancellation, lossless LDAC codec, and 45 hours battery life with rapid USB-C recharge.',
        category: 'Electronics',
        subcategory: 'Audio & Headphones',
        gender: 'unisex',
        brand: 'AcousticPro',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 8900,
        discountPrice: 6990,
        discountPercentage: 21,
        stock: 24,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Matte Black', 'Silver Moon', 'Midnight Blue'],
        sizes: ['Over-Ear Standard'],
        rating: 4.9,
        numReviews: 42,
        isFeatured: true,
        isNewArrival: true,
        isFlashSale: true,
        flashSalePrice: 6490,
        flashSaleDiscount: 27,
        flashSaleEnds: '2026-09-20T23:59:59Z',
        claimedPercentage: 68,
        badge: 'Flash Deal',
        specifications: {
          'Brand': 'AcousticPro',
          'Driver Size': '40mm Beryllium',
          'Battery Life': '45 Hours ANC On',
          'Connectivity': 'Bluetooth 5.3 & 3.5mm Aux',
          'Warranty': '1 Year Official Warranty'
        },
        sku: 'TP-AUD-001',
        createdAt: new Date('2025-02-01')
      },
      {
        _id: 'prod-elec-02',
        name: 'CinemaView 55" 4K Quantum Dot Dolby Vision Smart TV',
        slug: 'cinemaview-55-4k-quantum-dot-smart-tv',
        description: 'Featuring 120Hz native refresh rate, 1000 nits peak HDR brightness, integrated 60W Onkyo front-firing speakers, and Google TV OS with hands-free voice control.',
        category: 'Electronics',
        subcategory: 'Smart TVs',
        gender: 'unisex',
        brand: 'CinemaView',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 68000,
        discountPrice: 58500,
        discountPercentage: 14,
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Titanium Gray'],
        sizes: ['55 Inch'],
        rating: 4.8,
        numReviews: 29,
        isFeatured: true,
        isNewArrival: false,
        specifications: {
          'Display Type': 'QLED 4K UHD',
          'Refresh Rate': '120Hz Native VRR',
          'Audio': '60W Dolby Atmos',
          'OS': 'Google TV',
          'Warranty': '2 Years Panel Warranty'
        },
        sku: 'TP-TV-002',
        createdAt: new Date('2025-01-20')
      },

      // --- Mobile & Accessories ---
      {
        _id: 'prod-mob-01',
        name: 'Apex Ultra Titanium Smartwatch 49mm',
        slug: 'apex-ultra-titanium-smartwatch-49mm',
        description: 'Aerospace-grade titanium casing, sapphire crystal display with 3000 nits brightness, dual-frequency GPS, ECG monitor, blood oxygen tracker, and 100m water resistance.',
        category: 'Mobile & Accessories',
        subcategory: 'Smartwatches',
        gender: 'unisex',
        brand: 'Apex Tech',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 14500,
        discountPrice: 11900,
        discountPercentage: 18,
        stock: 19,
        images: [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Titanium Natural', 'Onyx Black', 'Safety Orange'],
        sizes: ['49mm Universal'],
        rating: 4.9,
        numReviews: 38,
        isFeatured: true,
        isNewArrival: true,
        isFlashSale: true,
        flashSalePrice: 10990,
        flashSaleDiscount: 24,
        flashSaleEnds: '2026-09-20T23:59:59Z',
        claimedPercentage: 81,
        badge: 'Best Seller',
        specifications: {
          'Casing Material': 'Titanium Grade 5',
          'Display': '1.96" Sapphire AMOLED',
          'Battery Life': 'Up to 5 Days Normal Use',
          'Water Resistance': '100m / 10 ATM',
          'Warranty': '1 Year Replacement'
        },
        sku: 'TP-MOB-001',
        createdAt: new Date('2025-02-10')
      },
      {
        _id: 'prod-mob-02',
        name: 'VoltFast 100W GaN 4-Port Fast Desktop Charger',
        slug: 'voltfast-100w-gan-4-port-fast-charger',
        description: 'Gallium Nitride technology delivering up to 100W USB-C Power Delivery. Safely charges your MacBook Pro, iPhone, and Android flagship simultaneously.',
        category: 'Mobile & Accessories',
        subcategory: 'Chargers & Power',
        gender: 'unisex',
        brand: 'VoltFast',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 3850,
        discountPrice: 3200,
        discountPercentage: 17,
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Space Gray', 'Arctic White'],
        sizes: ['Compact'],
        rating: 4.8,
        numReviews: 24,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Power Output': '100W Max',
          'Ports': '3x USB-C PD 3.0 + 1x USB-A QC 4.0',
          'Safety': 'Over-temp & Surge Protection',
          'Warranty': '1 Year Official'
        },
        sku: 'TP-CHG-002',
        createdAt: new Date('2025-02-12')
      },

      // --- Computers & Laptops ---
      {
        _id: 'prod-comp-01',
        name: 'Zenith Pro 16" Creator Laptop (Core Ultra 9 / RTX 4070)',
        slug: 'zenith-pro-16-creator-laptop',
        description: 'Engineered for developers, architects, and film colorists. Equipped with 3.2K OLED 120Hz calibrated panel, Intel Core Ultra 9 185H, RTX 4070 8GB, 32GB LPDDR5X, and 1TB NVMe SSD.',
        category: 'Computers & Laptops',
        subcategory: 'Laptops & Ultrabooks',
        gender: 'unisex',
        brand: 'Zenith Systems',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 185000,
        discountPrice: 172000,
        discountPercentage: 7,
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Anodized Space Gray'],
        sizes: ['16 Inch'],
        rating: 5.0,
        numReviews: 16,
        isFeatured: true,
        isNewArrival: true,
        specifications: {
          'Processor': 'Intel Core Ultra 9 185H',
          'Graphics': 'NVIDIA GeForce RTX 4070 8GB',
          'Memory': '32GB 7467MHz RAM',
          'Display': '16" 3.2K 120Hz OLED 100% DCI-P3',
          'Weight': '1.86 kg'
        },
        sku: 'TP-LAP-001',
        createdAt: new Date('2025-02-05')
      },
      {
        _id: 'prod-comp-02',
        name: 'KeyForge Carbon 75% Wireless Mechanical Keyboard',
        slug: 'keyforge-carbon-75-mechanical-keyboard',
        description: 'CNC machined solid aluminum body, gasket mount dampening structure, factory lubed tactile switches, hot-swappable sockets, and wireless 2.4Ghz + Bluetooth.',
        category: 'Computers & Laptops',
        subcategory: 'Keyboards & Mice',
        gender: 'unisex',
        brand: 'KeyForge',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 7800,
        discountPrice: 6500,
        discountPercentage: 17,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Carbon Gray', 'Retro Cream'],
        sizes: ['75% Compact'],
        rating: 4.9,
        numReviews: 31,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Switches': 'Gateron G Pro Brown / Linear',
          'Keycaps': 'PBT Dye-Sub OEM Profile',
          'Battery': '4000mAh (Up to 200 hours)',
          'Connectivity': 'Tri-Mode Wireless + Type-C'
        },
        sku: 'TP-KB-002',
        createdAt: new Date('2025-01-28')
      },

      // --- Men's Fashion (Zenvy Flagship) ---
      {
        _id: 'prod-men-01',
        name: 'Signature Heavyweight Oversized T-Shirt (260 GSM)',
        slug: 'signature-heavyweight-oversized-t-shirt',
        description: 'Engineered with 260 GSM custom-knit combed cotton for the signature Zenvy drape. Features a reinforced rib neckband, dropped shoulders, and subtle tonal embroidery.',
        category: "Men's Fashion",
        subcategory: 'T-Shirts & Polos',
        gender: 'men',
        brand: 'Zenvy Wear',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 1450,
        discountPrice: 1190,
        discountPercentage: 18,
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Onyx Black', 'Off White', 'Charcoal Smoke', 'Warm Sand'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        rating: 4.9,
        numReviews: 54,
        isFeatured: true,
        isNewArrival: true,
        badge: 'Atelier Essential',
        specifications: {
          'Fabric': '100% Combed Compact Cotton',
          'GSM': '260 Heavyweight Interlock',
          'Fit': 'Modern Relaxed Oversized',
          'Origin': 'Dhaka Atelier, Bangladesh'
        },
        sku: 'ZW-TEE-001',
        createdAt: new Date('2025-02-01')
      },
      {
        _id: 'prod-men-02',
        name: 'Confidence 450 GSM French Terry Minimalist Hoodie',
        slug: 'confidence-450-gsm-french-terry-hoodie',
        description: 'Heavyweight 450 GSM organic French terry fleece. Deep double-layer hood without drawstrings for an ultra-clean architectural aesthetic.',
        category: "Men's Fashion",
        subcategory: 'Hoodies & Jackets',
        gender: 'men',
        brand: 'Zenvy Wear',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 3450,
        discountPrice: 2850,
        discountPercentage: 17,
        stock: 32,
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Jet Black', 'Heather Ash', 'Moss Green'],
        sizes: ['M', 'L', 'XL'],
        rating: 4.9,
        numReviews: 33,
        isFeatured: true,
        isNewArrival: false,
        isFlashSale: true,
        flashSalePrice: 2550,
        flashSaleDiscount: 26,
        flashSaleEnds: '2026-09-20T23:59:59Z',
        claimedPercentage: 74,
        badge: 'Flash Deal',
        specifications: {
          'Material': '100% Organic French Terry Fleece',
          'Weight': '450 GSM Dense Weave',
          'Details': 'Reinforced Kangaroo Pocket',
          'Care': 'Machine wash cold inside-out'
        },
        sku: 'ZW-HOD-002',
        createdAt: new Date('2025-01-18')
      },
      {
        _id: 'prod-men-03',
        name: 'Italian Wool-Blend Structured Tailored Blazer',
        slug: 'italian-wool-blend-tailored-blazer',
        description: 'Crafted with structured peak lapels, cupro lining, functional horn buttons, and subtle soft shoulder padding. Seamlessly transitions from executive meetings to black-tie dinners.',
        category: "Men's Fashion",
        subcategory: 'Suits & Blazers',
        gender: 'men',
        brand: 'Zenvy Wear',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 8500,
        discountPrice: 6990,
        discountPercentage: 18,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Charcoal Slate', 'Midnight Navy', 'Espresso'],
        sizes: ['38R', '40R', '42R', '44R'],
        rating: 4.8,
        numReviews: 21,
        isFeatured: true,
        isNewArrival: true,
        specifications: {
          'Fabric Blend': '70% Wool, 28% Poly, 2% Elastane',
          'Lining': '100% Breathable Bemberg Cupro',
          'Lapel': 'Peak Lapel 3.5 Inch',
          'Cut': 'Modern Tailored Athletic'
        },
        sku: 'ZW-BLZ-003',
        createdAt: new Date('2025-02-08')
      },

      // --- Women's Fashion ---
      {
        _id: 'prod-wom-01',
        name: 'Draped Pure Mulberry Silk Wrap Evening Dress',
        slug: 'draped-pure-mulberry-silk-wrap-evening-dress',
        description: '22-momme pure grade 6A mulberry silk with an adjustable tie-waist drape, asymmetric hemline, and breathable cooling touch against the skin.',
        category: "Women's Fashion",
        subcategory: 'Dresses',
        gender: 'women',
        brand: 'Zenvy Wear',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 6500,
        discountPrice: 5200,
        discountPercentage: 20,
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Champagne Gold', 'Ruby Merlot', 'Emerald Dark'],
        sizes: ['XS', 'S', 'M', 'L'],
        rating: 4.9,
        numReviews: 27,
        isFeatured: true,
        isNewArrival: true,
        specifications: {
          'Material': '100% Pure Mulberry Silk 22-Momme',
          'Closure': 'Self-Tie Satin Belt',
          'Origin': 'Dhaka Luxury Studio',
          'Care': 'Dry clean only'
        },
        sku: 'ZW-DRS-004',
        createdAt: new Date('2025-01-25')
      },
      {
        _id: 'prod-wom-02',
        name: 'Relaxed Double-Breasted Linen Blazer & Trouser Set',
        slug: 'relaxed-double-breasted-linen-blazer-trouser-set',
        description: 'Pure French flax linen set featuring a nonchalant relaxed blazer and high-waisted wide-leg trousers. Unlined for breezy summer comfort.',
        category: "Women's Fashion",
        subcategory: 'Tailored Trousers',
        gender: 'women',
        brand: 'Zenvy Wear',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 5800,
        discountPrice: 4750,
        discountPercentage: 18,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Natural Oatmeal', 'Sage Cream', 'Ivory'],
        sizes: ['S', 'M', 'L'],
        rating: 4.8,
        numReviews: 19,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Fabric': '100% Certified French Flax Linen',
          'Set Includes': 'Blazer + Wide-Leg Trouser',
          'Fit': 'Effortless Oversized Slouch',
          'Pockets': 'Dual Jet Flap Pockets'
        },
        sku: 'ZW-SET-005',
        createdAt: new Date('2025-02-03')
      },

      // --- Kids & Baby ---
      {
        _id: 'prod-kid-01',
        name: 'Organic Bamboo-Cotton Baby Loungewear Set (Pack of 3)',
        slug: 'organic-bamboo-cotton-baby-loungewear-set',
        description: 'Ultra-gentle 70% organic bamboo viscose and 30% organic cotton rib knit. Hypoallergenic, thermal-regulating, and tagless for delicate newborn skin.',
        category: 'Kids & Baby',
        subcategory: 'Baby Clothes',
        gender: 'unisex',
        brand: 'Little Zenvy',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 1850,
        discountPrice: 1450,
        discountPercentage: 22,
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Pastel Sage', 'Warm Almond', 'Soft Blush'],
        sizes: ['0-3M', '3-6M', '6-12M', '12-18M'],
        rating: 4.9,
        numReviews: 23,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Material': '70% Organic Bamboo, 30% Cotton',
          'Safety': 'OEKO-TEX Standard 100 Certified',
          'Closure': 'Snap Buttons, Nickel-Free'
        },
        sku: 'ZW-KID-001',
        createdAt: new Date('2025-01-30')
      },

      // --- Shoes & Bags ---
      {
        _id: 'prod-shoe-01',
        name: 'Handcrafted Goodyear-Welted Chelsea Leather Boots',
        slug: 'handcrafted-goodyear-welted-chelsea-boots',
        description: 'Constructed from full-grain vegetable-tanned Italian calf leather with heavy-duty Dainite rubber lug soles. Fully resoleable for a lifetime of confident strides.',
        category: 'Shoes & Bags',
        subcategory: 'Leather Boots',
        gender: 'men',
        brand: 'Zenvy Atelier Leather',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 6800,
        discountPrice: 5490,
        discountPercentage: 19,
        stock: 16,
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Cognac Amber', 'Deep Espresso', 'Matte Black'],
        sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
        rating: 4.9,
        numReviews: 36,
        isFeatured: true,
        isNewArrival: true,
        badge: 'Craft Heritage',
        specifications: {
          'Construction': 'Traditional Goodyear Welt 360°',
          'Upper': 'Vegetable-Tanned Full Grain Leather',
          'Outsole': 'Dainite Studded Rubber',
          'Insole': 'Cork Footbed with Leather Sock'
        },
        sku: 'ZW-BOT-001',
        createdAt: new Date('2025-01-12')
      },
      {
        _id: 'prod-shoe-02',
        name: 'Heavyweight Waxed Canvas Weekend Travel Duffel',
        slug: 'heavyweight-waxed-canvas-weekend-duffel',
        description: '18 oz water-resistant Scottish waxed canvas reinforced with 3.5mm bridle leather handles, solid brass YKK double-zippers, and dedicated shoe compartment.',
        category: 'Shoes & Bags',
        subcategory: 'Travel Totes',
        gender: 'unisex',
        brand: 'Zenvy Atelier Leather',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 4950,
        discountPrice: 3990,
        discountPercentage: 19,
        stock: 22,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Field Tan', 'Olive Drab', 'Charcoal Slate'],
        sizes: ['45L Carry-On Approved'],
        rating: 4.9,
        numReviews: 28,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Canvas': '18 oz Waxed Cotton Duck',
          'Leather Trims': 'Full Grain Bridle Leather',
          'Capacity': '45 Liters',
          'Hardware': 'Solid Antiqued Brass'
        },
        sku: 'ZW-BAG-002',
        createdAt: new Date('2025-02-04')
      },

      // --- Beauty & Personal Care ---
      {
        _id: 'prod-bty-01',
        name: 'Luminescence Botanical Squalane & Peptide Serum 50ml',
        slug: 'luminescence-botanical-squalane-peptide-serum',
        description: 'Pure plant-derived sugarcane squalane infused with copper tripeptides and niacinamide. Restores skin moisture barrier, evens tone, and reduces fine lines.',
        category: 'Beauty & Personal Care',
        subcategory: 'Face Serums & Moisturizers',
        gender: 'unisex',
        brand: 'Botanica Luxe',
        sellerId: 'seller-gourmet',
        sellerName: 'The Royal Pantry & Care',
        sellerSlug: 'royal-pantry',
        price: 2450,
        discountPrice: 1950,
        discountPercentage: 20,
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['50ml Dropper Bottle'],
        sizes: ['50ml'],
        rating: 4.8,
        numReviews: 39,
        isFeatured: true,
        isNewArrival: true,
        specifications: {
          'Active Ingredients': '10% Sugarcane Squalane, 2% Copper Peptides',
          'Texture': 'Lightweight Silky Fluid',
          'Free From': 'Parabens, Sulfates, Artificial Fragrance'
        },
        sku: 'RP-SER-001',
        createdAt: new Date('2025-01-22')
      },

      // --- Home & Living ---
      {
        _id: 'prod-hom-01',
        name: 'Nordic Sculptural Matte Black Bedside Table Lamp',
        slug: 'nordic-sculptural-matte-black-lamp',
        description: 'Solid spun steel dome shade with a brass touch-dimmer base. Casts a warm 2700K indirect ambient glow for contemporary bedrooms and reading nooks.',
        category: 'Home & Living',
        subcategory: 'Designer Lighting',
        gender: 'unisex',
        brand: 'Apex Living',
        sellerId: 'seller-apex',
        sellerName: 'Apex Living & Home',
        sellerSlug: 'apex-living',
        price: 4500,
        discountPrice: 3600,
        discountPercentage: 20,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Matte Black', 'Brushed Brass', 'Sandstone White'],
        sizes: ['Standard 38cm Height'],
        rating: 4.9,
        numReviews: 25,
        isFeatured: true,
        isNewArrival: true,
        isFlashSale: true,
        flashSalePrice: 3190,
        flashSaleDiscount: 29,
        flashSaleEnds: '2026-09-20T23:59:59Z',
        claimedPercentage: 88,
        badge: 'Flash Deal',
        specifications: {
          'Material': 'Spun Steel with Powder Coating',
          'Light Source': 'Integrated 8W Warm LED (50,000 Hours)',
          'Dimming': '3-Step Touch Dimming',
          'Cord': '2m Braided Textile Cord'
        },
        sku: 'AL-LMP-001',
        createdAt: new Date('2025-02-07')
      },
      {
        _id: 'prod-hom-02',
        name: 'Solids 400TC Egyptian Cotton Percale Bed Sheet Set',
        slug: 'solids-400tc-egyptian-cotton-sheet-set',
        description: 'Woven in 400 thread count long-staple Egyptian cotton with a crisp matte percale finish that softens with every wash. Crisp, breathable, and hotel-luxe.',
        category: 'Home & Living',
        subcategory: 'Bedding & Linen',
        gender: 'unisex',
        brand: 'Apex Living',
        sellerId: 'seller-apex',
        sellerName: 'Apex Living & Home',
        sellerSlug: 'apex-living',
        price: 5200,
        discountPrice: 4250,
        discountPercentage: 18,
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Optic White', 'Slate Gray', 'Mist Olive'],
        sizes: ['Queen (90x100 in)', 'King (100x108 in)'],
        rating: 4.8,
        numReviews: 31,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Thread Count': '400 Thread Count',
          'Weave': 'Breathable Cool Crisp Percale',
          'Set Includes': '1 Flat Sheet, 1 Fitted Sheet, 2 Pillowcases'
        },
        sku: 'AL-BED-002',
        createdAt: new Date('2025-01-29')
      },

      // --- Kitchen & Appliances ---
      {
        _id: 'prod-kit-01',
        name: 'Artisan Barista Pro Dual-Boiler Espresso Machine',
        slug: 'artisan-barista-pro-espresso-machine',
        description: '15-bar Italian Ulka vibration pump, dual stainless thermoblock boilers, PID digital temperature control, and commercial 58mm stainless portafilter.',
        category: 'Kitchen & Appliances',
        subcategory: 'Espresso Machines',
        gender: 'unisex',
        brand: 'Apex Culinary',
        sellerId: 'seller-apex',
        sellerName: 'Apex Living & Home',
        sellerSlug: 'apex-living',
        price: 32000,
        discountPrice: 26900,
        discountPercentage: 16,
        stock: 7,
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Brushed Stainless Steel', 'Matte Truffle'],
        sizes: ['Countertop Standard'],
        rating: 4.9,
        numReviews: 18,
        isFeatured: true,
        isNewArrival: true,
        specifications: {
          'Pump Pressure': '15 Bar Italian Pressure',
          'Boiler System': 'Dual Thermoblock (Simultaneous Brew & Steam)',
          'Portafilter': 'Commercial Grade 58mm',
          'Warranty': '2 Years Motor & Pump'
        },
        sku: 'AL-ESP-001',
        createdAt: new Date('2025-02-09')
      },
      {
        _id: 'prod-kit-02',
        name: 'CrispAir 6.5L Digital Visible Window Air Fryer',
        slug: 'crispair-65l-digital-visible-window-air-fryer',
        description: '360° rapid cyclonic heat vortex, 1800W heating element, double-layer tempered glass window with interior viewing lamp, and 12 one-touch smart presets.',
        category: 'Kitchen & Appliances',
        subcategory: 'Air Fryers & Ovens',
        gender: 'unisex',
        brand: 'Apex Culinary',
        sellerId: 'seller-apex',
        sellerName: 'Apex Living & Home',
        sellerSlug: 'apex-living',
        price: 9500,
        discountPrice: 7800,
        discountPercentage: 18,
        stock: 22,
        images: [
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Obsidian Black', 'Pearl White'],
        sizes: ['6.5 Liters Family Size'],
        rating: 4.8,
        numReviews: 44,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Capacity': '6.5 Liters',
          'Power': '1800W High Efficiency',
          'Basket': 'Ceramic Non-Stick (Dishwasher Safe)',
          'Temp Range': '40°C - 200°C'
        },
        sku: 'AL-AFR-002',
        createdAt: new Date('2025-01-15')
      },

      // --- Grocery ---
      {
        _id: 'prod-groc-01',
        name: 'Sundarbans Raw Wildflower Organic Honey 500g',
        slug: 'sundarbans-raw-wildflower-organic-honey',
        description: 'Harvested ethically from the wild mangrove blossoms of the Sundarbans forest. 100% unpasteurized, cold-extracted, and rich in natural pollen and antioxidants.',
        category: 'Grocery',
        subcategory: 'Raw Honey',
        gender: 'unisex',
        brand: 'The Royal Pantry',
        sellerId: 'seller-gourmet',
        sellerName: 'The Royal Pantry & Care',
        sellerSlug: 'royal-pantry',
        price: 950,
        discountPrice: 790,
        discountPercentage: 17,
        stock: 60,
        images: [
          'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Amber Gold'],
        sizes: ['500g Glass Jar'],
        rating: 4.9,
        numReviews: 65,
        isFeatured: true,
        isNewArrival: false,
        specifications: {
          'Source': 'Sundarbans Forest, Bangladesh',
          'Purity': '100% Raw, Unprocessed',
          'Shelf Life': '24 Months'
        },
        sku: 'RP-HNY-001',
        createdAt: new Date('2025-01-10')
      },

      // --- Sports & Fitness ---
      {
        _id: 'prod-sprt-01',
        name: 'ProGrip Cast Iron Adjustable Dumbbell Set (24kg)',
        slug: 'progrip-cast-iron-adjustable-dumbbell-set',
        description: 'Dial-turn weight selector adjusting effortlessly from 2.5kg to 24kg in increments. Replaces 15 separate dumbbell pairs in a single compact footprint.',
        category: 'Sports & Fitness',
        subcategory: 'Gym Equipment',
        gender: 'unisex',
        brand: 'ProGear BD',
        sellerId: 'seller-progear',
        sellerName: 'ProGear & Automotives BD',
        sellerSlug: 'progear-bd',
        price: 16500,
        discountPrice: 13900,
        discountPercentage: 16,
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Steel Black & Red'],
        sizes: ['Single 24kg Dumbbell with Cradle'],
        rating: 4.9,
        numReviews: 29,
        isFeatured: true,
        isNewArrival: true,
        specifications: {
          'Weight Range': '2.5kg to 24kg (5 to 52.5 lbs)',
          'Mechanism': 'Precision Rotary Gear Lock',
          'Material': 'Silicon-Steel Plates with ABS Shell'
        },
        sku: 'PG-DMB-001',
        createdAt: new Date('2025-02-02')
      },

      // --- Automotive ---
      {
        _id: 'prod-auto-01',
        name: 'DriveGuard 4K Ultra HD Dual Dash Cam (Front + Rear)',
        slug: 'driveguard-4k-dual-dash-cam',
        description: 'Sony STARVIS 2 image sensor recording pristine 4K front and 1080p rear footage. Features GPS logging, 24-hour parking surveillance, and 5GHz Wi-Fi app download.',
        category: 'Automotive',
        subcategory: 'Dash Cameras',
        gender: 'unisex',
        brand: 'DriveGuard',
        sellerId: 'seller-progear',
        sellerName: 'ProGear & Automotives BD',
        sellerSlug: 'progear-bd',
        price: 11500,
        discountPrice: 9400,
        discountPercentage: 18,
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Stealth Black'],
        sizes: ['Dual Channel Kit'],
        rating: 4.8,
        numReviews: 32,
        isFeatured: true,
        isNewArrival: true,
        isFlashSale: true,
        flashSalePrice: 8850,
        flashSaleDiscount: 23,
        flashSaleEnds: '2026-09-20T23:59:59Z',
        claimedPercentage: 79,
        badge: 'Flash Deal',
        specifications: {
          'Front Camera': '4K UHD (3840x2160) @ 30FPS',
          'Rear Camera': '1080P FHD (1920x1080) @ 30FPS',
          'Sensor': 'Sony STARVIS 2 Night Vision',
          'Features': 'Built-in GPS, G-Sensor, Loop Recording'
        },
        sku: 'PG-CAM-001',
        createdAt: new Date('2025-01-26')
      },

      // --- Books & Stationery ---
      {
        _id: 'prod-bok-01',
        name: 'Atelier Brass Minimalist Heavyweight Fountain Pen',
        slug: 'atelier-brass-minimalist-fountain-pen',
        description: 'Turned from solid architectural raw brass that develops a rich unique patina over time. Equipped with a German Schmidt medium nib and piston ink converter.',
        category: 'Books & Stationery',
        subcategory: 'Fine Fountain Pens',
        gender: 'unisex',
        brand: 'Zenvy Atelier',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 2600,
        discountPrice: 2100,
        discountPercentage: 19,
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Raw Brushed Brass', 'Matte Black Oxide'],
        sizes: ['Medium 0.5mm Nib'],
        rating: 4.9,
        numReviews: 22,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Body': '100% Solid Machined Brass',
          'Nib': 'German Schmidt Gold-Plated Steel (M)',
          'Filling': 'Piston Converter or International Cartridge'
        },
        sku: 'ZW-PEN-001',
        createdAt: new Date('2025-02-06')
      },

      // --- Jewelry & Accessories ---
      {
        _id: 'prod-jwl-01',
        name: 'Monarch Dual-Time Chronograph Watch with Sapphire Crystal',
        slug: 'monarch-dual-time-chronograph-watch',
        description: '316L marine-grade stainless steel casing with anti-reflective flat sapphire crystal, Japanese Seiko VK64 meca-quartz movement, and genuine Horween leather strap.',
        category: 'Jewelry & Accessories',
        subcategory: 'Watches',
        gender: 'unisex',
        brand: 'Monarch Timepieces',
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship',
        sellerSlug: 'zenvy-official',
        price: 12500,
        discountPrice: 9800,
        discountPercentage: 22,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Silver Panda Dial', 'Onyx Monochrome'],
        sizes: ['40mm Diameter / 20mm Lug'],
        rating: 5.0,
        numReviews: 41,
        isFeatured: true,
        isNewArrival: true,
        badge: 'Horology Selection',
        specifications: {
          'Case': '316L Stainless Steel 40mm',
          'Glass': 'Flat Sapphire with Anti-Reflective Coating',
          'Movement': 'Seiko VK64 Hybrid Meca-Quartz',
          'Water Resistance': '5 ATM / 50 Meters'
        },
        sku: 'ZW-WAT-001',
        createdAt: new Date('2025-01-14')
      },

      // --- Gadgets ---
      {
        _id: 'prod-gdt-01',
        name: 'AeroSky 4K Pocket Drone with 3-Axis Mechanical Gimbal',
        slug: 'aerosky-4k-pocket-drone',
        description: 'Weighing under 249g to avoid flight registration hassle. 4K HDR 60FPS video, 31 minutes flight endurance, 10km digital video transmission, and GPS auto-return.',
        category: 'Gadgets',
        subcategory: 'Drones & Gimbal',
        gender: 'unisex',
        brand: 'AeroSky',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 38000,
        discountPrice: 32500,
        discountPercentage: 14,
        stock: 9,
        images: [
          'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Arctic Gray'],
        sizes: ['Fly More Combo (3 Batteries + Bag)'],
        rating: 4.8,
        numReviews: 27,
        isFeatured: true,
        isNewArrival: true,
        specifications: {
          'Takeoff Weight': '246 Grams Ultralight',
          'Flight Time': 'Up to 31 Minutes per battery',
          'Camera': '1/1.3" CMOS 4K 60FPS HDR',
          'Range': 'Up to 10km OcuSync 3.0'
        },
        sku: 'TP-DRN-001',
        createdAt: new Date('2025-02-11')
      },
      {
        _id: 'prod-gdt-02',
        name: 'Aura Ring Biometric Health & Sleep Titanium Smart Ring',
        slug: 'aura-ring-biometric-health-smart-ring',
        description: 'Featherlight medical-grade titanium ring monitoring heart rate variability, skin temperature fluctuations, sleep cycles, and daily recovery scores without subscription fees.',
        category: 'Gadgets',
        subcategory: 'Smart Rings & Wearables',
        gender: 'unisex',
        brand: 'Aura Health',
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD',
        sellerSlug: 'techpulse-bd',
        price: 15500,
        discountPrice: 12800,
        discountPercentage: 17,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Stealth Matte Black', 'Silver Mirror', 'Rose Gold'],
        sizes: ['Size 8', 'Size 9', 'Size 10', 'Size 11'],
        rating: 4.9,
        numReviews: 35,
        isFeatured: true,
        isNewArrival: true,
        isFlashSale: true,
        flashSalePrice: 11900,
        flashSaleDiscount: 23,
        flashSaleEnds: '2026-09-20T23:59:59Z',
        claimedPercentage: 86,
        badge: 'Flash Deal',
        specifications: {
          'Material': 'Titanium with Diamond-Like Carbon Coating',
          'Sensors': 'Infrared PPG, Temperature Sensor, Accelerometer',
          'Battery': 'Up to 7 Days Battery Life',
          'Water Resistance': '100m Waterproof'
        },
        sku: 'TP-RNG-002',
        createdAt: new Date('2025-01-24')
      },

      // --- Industrial Products ---
      {
        _id: 'prod-ind-01',
        name: 'LaserMeasure Pro 100M Digital Laser Distance Meter',
        slug: 'lasermeasure-pro-100m-digital-meter',
        description: '±1.5mm high accuracy optical laser meter with Pythagorean theorem area/volume calculation, electronic angle sensor, backlit color LCD, and Bluetooth data export.',
        category: 'Industrial Products',
        subcategory: 'Measuring Tools',
        gender: 'unisex',
        brand: 'ProGear Industrial',
        sellerId: 'seller-progear',
        sellerName: 'ProGear & Automotives BD',
        sellerSlug: 'progear-bd',
        price: 3600,
        discountPrice: 2950,
        discountPercentage: 18,
        stock: 28,
        images: [
          'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop'
        ],
        colors: ['Industrial Yellow & Black'],
        sizes: ['100 Meter Range'],
        rating: 4.8,
        numReviews: 21,
        isFeatured: false,
        isNewArrival: true,
        specifications: {
          'Measurement Range': '0.05m to 100m',
          'Accuracy': '±1.5mm Precise',
          'Protection': 'IP54 Water and Dust Proof',
          'Display': '2.0" Backlit Color Display'
        },
        sku: 'PG-IND-001',
        createdAt: new Date('2025-01-16')
      }
    ];

    // Recalculate category itemCount dynamically
    this.categories.forEach(cat => {
      const count = this.products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
      cat.itemCount = count > 0 ? count : 4;
    });

    // 6. Seed Sample Multi-Seller Order for Customer
    const sampleOrderItems = [
      {
        productId: 'prod-men-01',
        name: 'Signature Heavyweight Oversized T-Shirt (260 GSM)',
        price: 1190,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        size: 'L',
        color: 'Onyx Black',
        quantity: 2,
        sellerId: 'seller-zenvy',
        sellerName: 'Zenvy Official Flagship'
      },
      {
        productId: 'prod-elec-01',
        name: 'AcousticPro Studio 4 Wireless ANC Headphones',
        price: 6990,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
        size: 'Over-Ear Standard',
        color: 'Matte Black',
        quantity: 1,
        sellerId: 'seller-techpulse',
        sellerName: 'TechPulse Innovations BD'
      }
    ];

    const sampleOrder: IOrder = {
      _id: 'ord-seed-01',
      orderNumber: 'ZW-98421',
      userId: 'usr-cust-01',
      items: sampleOrderItems,
      sellerPackages: [
        {
          sellerId: 'seller-zenvy',
          sellerName: 'Zenvy Official Flagship',
          items: [sampleOrderItems[0]],
          subtotal: 2380,
          shippingFee: 80,
          status: 'Shipped'
        },
        {
          sellerId: 'seller-techpulse',
          sellerName: 'TechPulse Innovations BD',
          items: [sampleOrderItems[1]],
          subtotal: 6990,
          shippingFee: 80,
          status: 'Confirmed'
        }
      ],
      shippingAddress: {
        fullName: 'Masum Parvej',
        email: 'customer@zenvywear.com',
        phone: '+8801822334455',
        address: 'Flat 4B, Green Garden Tower, Sector 4, Uttara',
        city: 'Dhaka',
        area: 'Uttara',
        postalCode: '1230'
      },
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      subtotal: 9370,
      discount: 0,
      couponCode: '',
      shippingFee: 160,
      total: 9530,
      trackingHistory: [
        {
          status: 'Pending',
          timestamp: new Date('2025-02-14T10:00:00Z'),
          note: 'Order successfully placed. Split into 2 seller packages.'
        },
        {
          status: 'Confirmed',
          timestamp: new Date('2025-02-14T11:30:00Z'),
          note: 'Confirmed by Zenvy Flagship and TechPulse Innovations.'
        },
        {
          status: 'Processing',
          timestamp: new Date('2025-02-14T14:15:00Z'),
          note: 'Packages packed and handed to courier partner for express dispatch.'
        }
      ],
      createdAt: new Date('2025-02-14T10:00:00Z')
    };

    this.orders.push(sampleOrder);
  }

  // --- USER METHODS ---
  public findUserById(id: string): IUser | undefined {
    return this.users.find(u => u._id === id);
  }

  public findUserByEmail(email: string): IUser | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Partial<IUser>): IUser {
    const newUser: IUser = {
      _id: 'usr-' + Date.now(),
      name: userData.name || '',
      email: (userData.email || '').toLowerCase(),
      phone: userData.phone || '',
      password: userData.password,
      role: userData.role || 'user',
      sellerId: userData.sellerId,
      isBlocked: false,
      addresses: userData.addresses || [],
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<IUser>): IUser | null {
    const idx = this.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  // --- SELLER METHODS ---
  public getSellers(status?: 'approved' | 'pending' | 'suspended'): ISeller[] {
    if (status) {
      return this.sellers.filter(s => s.status === status);
    }
    return this.sellers;
  }

  public getSellerById(id: string): ISeller | undefined {
    return this.sellers.find(s => s._id === id || s.slug === id);
  }

  public getSellerBySlug(slug: string): ISeller | undefined {
    return this.sellers.find(s => s.slug === slug || s._id === slug);
  }

  public createSeller(sellerData: Partial<ISeller>): ISeller {
    const slug = sellerData.storeName
      ? sellerData.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'store-' + Date.now();

    const newSeller: ISeller = {
      _id: 'seller-' + Date.now(),
      userId: sellerData.userId,
      storeName: sellerData.storeName || 'New Marketplace Store',
      slug,
      logo: sellerData.logo || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=200&auto=format&fit=crop',
      banner: sellerData.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
      description: sellerData.description || 'Verified merchant offering premium products on Zenvy Wear Marketplace.',
      category: sellerData.category || 'Multi-Category',
      phone: sellerData.phone || '',
      email: sellerData.email || '',
      address: sellerData.address || 'Dhaka, Bangladesh',
      status: sellerData.status || 'pending',
      rating: 5.0,
      numReviews: 0,
      joinedDate: new Date(),
      isOfficialStore: false,
      tradeLicense: sellerData.tradeLicense || '',
      shippingFee: sellerData.shippingFee || 80,
      returnRate: '100%',
      responseRate: '100%',
      totalSales: 0
    };

    this.sellers.push(newSeller);

    // If a user ID was provided, upgrade their role to seller
    if (sellerData.userId) {
      const u = this.users.find(usr => usr._id === sellerData.userId);
      if (u) {
        u.role = 'seller';
        u.sellerId = newSeller._id;
      }
    }

    return newSeller;
  }

  public updateSellerStatus(id: string, status: 'approved' | 'pending' | 'suspended'): ISeller | null {
    const seller = this.getSellerById(id);
    if (!seller) return null;
    seller.status = status;
    return seller;
  }

  public getSellerProducts(sellerId: string): IProduct[] {
    return this.products.filter(p => p.sellerId === sellerId);
  }

  public getSellerOrders(sellerId: string): Array<{ order: IOrder; sellerPackage: ISellerPackage }> {
    const results: Array<{ order: IOrder; sellerPackage: ISellerPackage }> = [];
    for (const ord of this.orders) {
      if (ord.sellerPackages) {
        const pkg = ord.sellerPackages.find(p => p.sellerId === sellerId);
        if (pkg) {
          results.push({ order: ord, sellerPackage: pkg });
        }
      } else {
        const sellerItems = ord.items.filter(i => i.sellerId === sellerId);
        if (sellerItems.length > 0) {
          const subtotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          results.push({
            order: ord,
            sellerPackage: {
              sellerId,
              sellerName: sellerItems[0].sellerName || 'Seller Store',
              items: sellerItems,
              subtotal,
              shippingFee: 80,
              status: (ord.orderStatus as any) || 'Pending'
            }
          });
        }
      }
    }
    return results;
  }

  public updateSellerPackageStatus(orderId: string, sellerId: string, status: ISellerPackage['status']): boolean {
    const order = this.getOrderById(orderId);
    if (!order || !order.sellerPackages) return false;
    const pkg = order.sellerPackages.find(p => p.sellerId === sellerId);
    if (!pkg) return false;
    pkg.status = status;

    // Check if all packages are delivered / shipped
    const allStatuses = order.sellerPackages.map(p => p.status);
    if (allStatuses.every(s => s === 'Delivered')) {
      order.orderStatus = 'Delivered';
      order.paymentStatus = 'Paid';
    } else if (allStatuses.some(s => s === 'Shipped' || s === 'Delivered')) {
      order.orderStatus = 'Shipped';
    } else if (allStatuses.some(s => s === 'Processing')) {
      order.orderStatus = 'Processing';
    }

    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      note: `Package from ${pkg.sellerName} marked as ${status}`
    });

    return true;
  }

  public getSellerStats(sellerId: string) {
    const seller = this.getSellerById(sellerId);
    const sellerProds = this.getSellerProducts(sellerId);
    const sellerOrderList = this.getSellerOrders(sellerId);

    const totalRevenue = sellerOrderList.reduce((acc, curr) => acc + curr.sellerPackage.subtotal, 0);
    const totalOrders = sellerOrderList.length;
    const activeProducts = sellerProds.length;
    const pendingFulfillments = sellerOrderList.filter(o => o.sellerPackage.status === 'Pending' || o.sellerPackage.status === 'Processing').length;

    return {
      seller,
      totalRevenue,
      totalOrders,
      activeProducts,
      pendingFulfillments,
      recentOrders: sellerOrderList.slice(0, 10),
      topProducts: sellerProds.slice(0, 5)
    };
  }

  // --- COUPON METHODS ---
  public validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: ICoupon; discount: number; message: string } {
    const c = this.coupons.find(cp => cp.code.toUpperCase() === code.trim().toUpperCase() && cp.isActive);
    if (!c) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (new Date() > new Date(c.expiresAt)) {
      return { valid: false, discount: 0, message: 'This coupon code has expired.' };
    }

    if (subtotal < c.minOrderAmount) {
      return { valid: false, discount: 0, message: `Minimum order amount of ৳ ${c.minOrderAmount} required for this coupon.` };
    }

    let discount = 0;
    if (c.discountType === 'percentage') {
      discount = Math.round((subtotal * c.discountValue) / 100);
    } else if (c.discountType === 'fixed') {
      discount = Math.min(subtotal, c.discountValue);
    } else if (c.discountType === 'shipping') {
      discount = 80; // Standard shipping waiver
    }

    return {
      valid: true,
      coupon: c,
      discount,
      message: `Coupon "${c.code}" applied! You saved ৳ ${discount}.`
    };
  }

  // --- PRODUCT METHODS ---
  public getProducts(filters: {
    category?: string;
    subcategory?: string;
    gender?: string;
    sellerId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isFlashSale?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): { products: IProduct[]; total: number; page: number; totalPages: number } {
    let result = [...this.products];

    // Filter by Category
    if (filters.category && filters.category !== 'all') {
      const catLower = filters.category.toLowerCase().trim();
      result = result.filter(p => p.category.toLowerCase().trim() === catLower);
    }

    // Filter by Subcategory
    if (filters.subcategory && filters.subcategory !== 'all') {
      const subLower = filters.subcategory.toLowerCase().trim();
      result = result.filter(p => p.subcategory && p.subcategory.toLowerCase().trim() === subLower);
    }

    // Filter by Gender / Department
    if (filters.gender && filters.gender !== 'all') {
      result = result.filter(p => p.gender === filters.gender || p.gender === 'unisex');
    }

    // Filter by Seller
    if (filters.sellerId && filters.sellerId !== 'all') {
      result = result.filter(p => p.sellerId === filters.sellerId || p.sellerSlug === filters.sellerId);
    }

    // Filter by Flash Sale
    if (filters.isFlashSale) {
      result = result.filter(p => p.isFlashSale === true);
    }

    // Filter by Search
    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        (p.sellerName && p.sellerName.toLowerCase().includes(query))
      );
    }

    // Filter by Price
    if (filters.minPrice !== undefined) {
      result = result.filter(p => (p.discountPrice || p.price) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => (p.discountPrice || p.price) <= filters.maxPrice!);
    }

    // Filter by Rating
    if (filters.rating && filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating!);
    }

    // Filter by Flags
    if (filters.isFeatured) {
      result = result.filter(p => p.isFeatured);
    }
    if (filters.isNewArrival) {
      result = result.filter(p => p.isNewArrival);
    }

    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-low':
          result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          break;
        case 'price-high':
          result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'discount':
          result.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    const total = result.length;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = result.slice(startIndex, startIndex + limit);

    return {
      products: paginatedProducts,
      total,
      page,
      totalPages
    };
  }

  public getProductById(id: string): IProduct | undefined {
    return this.products.find(p => p._id === id || p.slug === id);
  }

  public getCompareProducts(ids: string[]): IProduct[] {
    return this.products.filter(p => ids.includes(p._id));
  }

  public getFlashSales(): IProduct[] {
    return this.products.filter(p => p.isFlashSale === true);
  }

  public createProduct(productData: Partial<IProduct>): IProduct {
    const slug = (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const seller = this.getSellerById(productData.sellerId || 'seller-zenvy');

    const newProduct: IProduct = {
      _id: 'prod-' + Date.now(),
      name: productData.name || 'New Product',
      slug: slug + '-' + Math.floor(Math.random() * 1000),
      description: productData.description || '',
      category: productData.category || "Men's Fashion",
      subcategory: productData.subcategory,
      gender: productData.gender || 'unisex',
      brand: productData.brand || (seller ? seller.storeName : 'Zenvy Wear'),
      sellerId: seller ? seller._id : 'seller-zenvy',
      sellerName: seller ? seller.storeName : 'Zenvy Official Flagship',
      sellerSlug: seller ? seller.slug : 'zenvy-official',
      price: productData.price || 1000,
      discountPrice: productData.discountPrice,
      discountPercentage: productData.discountPercentage || 0,
      stock: productData.stock || 10,
      images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'],
      colors: productData.colors || ['Black'],
      sizes: productData.sizes || ['M'],
      rating: 5.0,
      numReviews: 0,
      isFeatured: productData.isFeatured || false,
      isNewArrival: productData.isNewArrival !== undefined ? productData.isNewArrival : true,
      isFlashSale: productData.isFlashSale || false,
      flashSalePrice: productData.flashSalePrice,
      flashSaleDiscount: productData.flashSaleDiscount,
      flashSaleEnds: productData.flashSaleEnds,
      claimedPercentage: productData.claimedPercentage || 0,
      badge: productData.badge,
      specifications: productData.specifications || {},
      sku: productData.sku || 'ZW-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date()
    };

    this.products.unshift(newProduct);
    return newProduct;
  }

  public updateProduct(id: string, updateData: Partial<IProduct>): IProduct | null {
    const idx = this.products.findIndex(p => p._id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...updateData };
    return this.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.products.length;
    this.products = this.products.filter(p => p._id !== id);
    return this.products.length < prevLen;
  }

  // --- CATEGORY METHODS ---
  public getCategories(): ICategory[] {
    return this.categories;
  }

  public getCategoryBySlug(slug: string): ICategory | undefined {
    return this.categories.find(c => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
  }

  // --- MULTI-SELLER CART METHODS ---
  public getCart(userId: string): ICart {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, {
        _id: 'cart-' + userId,
        userId,
        items: [],
        updatedAt: new Date()
      });
    }
    return this.carts.get(userId)!;
  }

  public getCartSummary(userId: string, isOutsideDhaka = false) {
    const cart = this.getCart(userId);
    const items = cart.items || [];

    // Group items by seller
    const sellerGroupMap = new Map<string, {
      sellerId: string;
      sellerName: string;
      items: ICartItem[];
      subtotal: number;
      shippingFee: number;
    }>();

    let orderSubtotal = 0;

    for (const item of items) {
      const sellerId = item.sellerId || 'seller-zenvy';
      const sellerName = item.sellerName || 'Zenvy Official Flagship';
      const effectivePrice = item.discountPrice || item.price;
      const itemSubtotal = effectivePrice * item.quantity;
      orderSubtotal += itemSubtotal;

      if (!sellerGroupMap.has(sellerId)) {
        sellerGroupMap.set(sellerId, {
          sellerId,
          sellerName,
          items: [],
          subtotal: 0,
          shippingFee: isOutsideDhaka ? 130 : 80
        });
      }

      const grp = sellerGroupMap.get(sellerId)!;
      grp.items.push(item);
      grp.subtotal += itemSubtotal;
    }

    const sellerGroups = Array.from(sellerGroupMap.values());

    // Calculate seller shipping: free shipping if total order is >= 5000, or if individual seller subtotal >= 3000
    let totalShipping = 0;
    if (orderSubtotal >= 5000) {
      sellerGroups.forEach(grp => { grp.shippingFee = 0; });
      totalShipping = 0;
    } else {
      sellerGroups.forEach(grp => {
        if (grp.subtotal >= 3000) {
          grp.shippingFee = 0;
        }
        totalShipping += grp.shippingFee;
      });
    }

    return {
      cart,
      sellerGroups,
      summary: {
        itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
        subtotal: orderSubtotal,
        shippingFee: totalShipping,
        isMultiSeller: sellerGroups.length > 1,
        total: orderSubtotal + totalShipping
      }
    };
  }

  public addToCart(userId: string, item: {
    productId: string;
    size?: string;
    color?: string;
    quantity?: number;
  }): ICart {
    const cart = this.getCart(userId);
    const prod = this.getProductById(item.productId);
    if (!prod) {
      throw new Error('Product not found');
    }

    const qty = item.quantity || 1;
    const size = item.size || (prod.sizes[0] || 'Standard');
    const color = item.color || (prod.colors[0] || 'Default');

    // Check if item with same productId, size, color already exists
    const existingIndex = cart.items.findIndex(
      i => i.productId === item.productId && i.size === size && i.color === color
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
    } else {
      cart.items.push({
        id: 'ci-' + Date.now() + Math.random().toString(36).substr(2, 4),
        productId: prod._id,
        name: prod.name,
        sellerId: prod.sellerId || 'seller-zenvy',
        sellerName: prod.sellerName || 'Zenvy Official Flagship',
        price: prod.price,
        discountPrice: (prod.isFlashSale && prod.flashSalePrice) ? prod.flashSalePrice : prod.discountPrice,
        image: prod.images[0] || '',
        size,
        color,
        quantity: qty,
        stock: prod.stock
      });
    }

    cart.updatedAt = new Date();
    return cart;
  }

  public updateCartItem(userId: string, itemId: string, quantity: number, size?: string, color?: string): ICart {
    const cart = this.getCart(userId);
    const item = cart.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      if (size) item.size = size;
      if (color) item.color = color;
    }
    cart.updatedAt = new Date();
    return cart;
  }

  public removeCartItem(userId: string, itemId: string): ICart {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter(i => i.id !== itemId);
    cart.updatedAt = new Date();
    return cart;
  }

  public clearCart(userId: string): ICart {
    const cart = this.getCart(userId);
    cart.items = [];
    cart.updatedAt = new Date();
    return cart;
  }

  // --- WISHLIST METHODS ---
  public getWishlist(userId: string): { productIds: string[]; products: IProduct[] } {
    if (!this.wishlists.has(userId)) {
      this.wishlists.set(userId, {
        _id: 'wish-' + userId,
        userId,
        productIds: [],
        updatedAt: new Date()
      });
    }
    const wishlist = this.wishlists.get(userId)!;
    const products = this.products.filter(p => wishlist.productIds.includes(p._id));
    return { productIds: wishlist.productIds, products };
  }

  public toggleWishlist(userId: string, productId: string): { inWishlist: boolean; count: number } {
    const wl = this.wishlists.get(userId) || {
      _id: 'wish-' + userId,
      userId,
      productIds: [],
      updatedAt: new Date()
    };

    const idx = wl.productIds.indexOf(productId);
    let inWishlist = false;
    if (idx > -1) {
      wl.productIds.splice(idx, 1);
      inWishlist = false;
    } else {
      wl.productIds.push(productId);
      inWishlist = true;
    }
    wl.updatedAt = new Date();
    this.wishlists.set(userId, wl);
    return { inWishlist, count: wl.productIds.length };
  }

  // --- ORDER METHODS (MULTI-SELLER AWARE) ---
  public createOrder(orderData: Partial<IOrder>): IOrder {
    const num = 'ZW-' + Math.floor(10000 + Math.random() * 90000);
    const items = orderData.items || [];

    // Group items into sellerPackages
    const sellerPkgMap = new Map<string, ISellerPackage>();
    for (const item of items) {
      const sellerId = item.sellerId || 'seller-zenvy';
      const sellerName = item.sellerName || 'Zenvy Official Flagship';
      const itemTotal = item.price * item.quantity;

      if (!sellerPkgMap.has(sellerId)) {
        sellerPkgMap.set(sellerId, {
          sellerId,
          sellerName,
          items: [],
          subtotal: 0,
          shippingFee: 80,
          status: 'Pending'
        });
      }

      const pkg = sellerPkgMap.get(sellerId)!;
      pkg.items.push(item);
      pkg.subtotal += itemTotal;
    }

    const sellerPackages = Array.from(sellerPkgMap.values());

    const newOrder: IOrder = {
      _id: 'ord-' + Date.now(),
      orderNumber: num,
      userId: orderData.userId || 'guest',
      items,
      sellerPackages,
      shippingAddress: orderData.shippingAddress!,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      paymentStatus: orderData.paymentStatus || 'Pending',
      orderStatus: 'Pending',
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode,
      shippingFee: orderData.shippingFee || 80,
      total: orderData.total || 0,
      trackingHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: `Order placed successfully with ${sellerPackages.length} seller package(s). Awaiting seller dispatch.`
        }
      ],
      createdAt: new Date()
    };

    // Deduct stock for ordered items
    for (const item of newOrder.items) {
      const p = this.products.find(prod => prod._id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }

    this.orders.unshift(newOrder);

    // Clear cart if user placed order
    if (orderData.userId) {
      this.clearCart(orderData.userId);
    }

    return newOrder;
  }

  public getOrders(userId?: string): IOrder[] {
    if (userId) {
      return this.orders.filter(o => o.userId === userId);
    }
    return this.orders;
  }

  public getOrderById(id: string): IOrder | undefined {
    return this.orders.find(o => o._id === id || o.orderNumber === id);
  }

  public updateOrderStatus(orderId: string, status: IOrder['orderStatus'], note?: string): IOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    order.orderStatus = status;
    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });
    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }
    return order;
  }

  public updatePaymentStatus(orderId: string, status: IOrder['paymentStatus']): IOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    order.paymentStatus = status;
    return order;
  }

  // --- REVIEWS ---
  public getReviewsForProduct(productId: string): IReview[] {
    return this.reviews.filter(r => r.productId === productId);
  }

  public addReview(data: { userId: string; userName: string; userEmail?: string; productId: string; rating: number; comment: string }): IReview {
    const review: IReview = {
      _id: 'rev-' + Date.now(),
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      productId: data.productId,
      rating: Math.min(5, Math.max(1, data.rating)),
      comment: data.comment,
      isVerifiedPurchase: true,
      createdAt: new Date()
    };
    this.reviews.unshift(review);

    // Recalculate product rating
    const prod = this.products.find(p => p._id === data.productId);
    if (prod) {
      const prodReviews = this.getReviewsForProduct(data.productId);
      const sum = prodReviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.rating = Number((sum / prodReviews.length).toFixed(1));
      prod.numReviews = prodReviews.length;
    }

    return review;
  }

  public deleteReview(id: string): boolean {
    const rev = this.reviews.find(r => r._id === id);
    if (!rev) return false;
    const prodId = rev.productId;
    this.reviews = this.reviews.filter(r => r._id !== id);

    const prod = this.products.find(p => p._id === prodId);
    if (prod) {
      const prodReviews = this.getReviewsForProduct(prodId);
      if (prodReviews.length === 0) {
        prod.rating = 5.0;
        prod.numReviews = 0;
      } else {
        const sum = prodReviews.reduce((acc, curr) => acc + curr.rating, 0);
        prod.rating = Number((sum / prodReviews.length).toFixed(1));
        prod.numReviews = prodReviews.length;
      }
    }
    return true;
  }

  // --- ADMIN MARKETPLACE STATS ---
  public getAdminStats() {
    const totalSales = this.orders.reduce((acc, o) => (o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered') ? acc + o.total : acc, 0);
    const totalOrders = this.orders.length;
    const totalUsers = this.users.filter(u => u.role === 'user').length;
    const totalSellers = this.sellers.length;
    const totalProducts = this.products.length;
    const pendingOrders = this.orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
    const deliveredOrders = this.orders.filter(o => o.orderStatus === 'Delivered').length;
    const pendingSellers = this.sellers.filter(s => s.status === 'pending').length;

    const monthlySales = [
      { month: 'Oct', sales: 95000, orders: 35 },
      { month: 'Nov', sales: 145000, orders: 54 },
      { month: 'Dec', sales: 220000, orders: 82 },
      { month: 'Jan', sales: 310000, orders: 110 },
      { month: 'Feb', sales: 420000, orders: 145 },
      { month: 'Mar', sales: totalSales > 0 ? totalSales : 540000, orders: totalOrders > 0 ? totalOrders : 188 }
    ];

    const topSellers = this.sellers.map(s => ({
      _id: s._id,
      storeName: s.storeName,
      category: s.category,
      rating: s.rating,
      productCount: this.getSellerProducts(s._id).length,
      status: s.status
    }));

    return {
      totalSales,
      totalOrders,
      totalUsers,
      totalSellers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
      pendingSellers,
      monthlySales,
      topSellers,
      recentOrders: this.orders.slice(0, 8)
    };
  }
}

export const dbStore = new DatabaseStore();
