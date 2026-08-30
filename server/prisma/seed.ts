import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌾 Seeding Namma Farm Database with comprehensive agricultural production data for all 22 features...');

  // Clean up in reverse relation dependency order
  await prisma.expertReview.deleteMany();
  await prisma.expertConsultation.deleteMany();
  await prisma.expertAvailability.deleteMany();
  await prisma.expertProfile.deleteMany();
  await prisma.wasteOrder.deleteMany();
  await prisma.wasteOffer.deleteMany();
  await prisma.agriWasteListing.deleteMany();
  await prisma.communityReport.deleteMany();
  await prisma.communityLike.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.farmerPassport.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.insurancePolicy.deleteMany();
  await prisma.insuranceProduct.deleteMany();
  await prisma.loanApplication.deleteMany();
  await prisma.agriLoanProduct.deleteMany();
  await prisma.transportBooking.deleteMany();
  await prisma.transportVehicle.deleteMany();
  await prisma.equipmentBooking.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.calendarTask.deleteMany();
  await prisma.cropCalendar.deleteMany();
  await prisma.irrigationAdvisory.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.storageBooking.deleteMany();
  await prisma.storageCenter.deleteMany();
  await prisma.procurementBooking.deleteMany();
  await prisma.procurementCenter.deleteMany();
  await prisma.mSPPrice.deleteMany();
  await prisma.savedScheme.deleteMany();
  await prisma.schemeApplication.deleteMany();
  await prisma.governmentScheme.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.queryAttachment.deleteMany();
  await prisma.queryMessage.deleteMany();
  await prisma.farmerQuery.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.trustScore.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cropImage.deleteMany();
  await prisma.cropListing.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.diseaseRecommendation.deleteMany();
  await prisma.diseaseScan.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.profitPrediction.deleteMany();
  await prisma.marketPrediction.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.marketPriceSource.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.governmentProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Standard passwords
  const farmerPassword = await bcrypt.hash('Farmer@123', 10);
  const buyerPassword = await bcrypt.hash('Buyer@123', 10);
  const govPassword = await bcrypt.hash('Gov@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const expertPassword = await bcrypt.hash('Expert@123', 10);

  // --------------------------------------------------------
  // 1. MASTER CROPS
  // --------------------------------------------------------
  console.log('🌱 Creating Master Crops catalog...');
  const tomato = await prisma.crop.create({
    data: {
      name: 'Tomato',
      category: 'VEGETABLES',
      variety: 'Hybrid Shivam / Sahu',
      description: 'Firm, glossy red tomatoes with high shelf life and excellent acid-sugar balance.',
      season: 'YEAR_ROUND',
      idealSoil: 'Well-drained red loamy and alluvial soils',
      gestationPeriodDays: 90,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
    },
  });

  const banana = await prisma.crop.create({
    data: {
      name: 'Banana',
      category: 'FRUITS',
      variety: 'Grand Naine (G9) / Robusta',
      description: 'High-yielding commercial table banana with uniform finger length and high sweetness.',
      season: 'YEAR_ROUND',
      idealSoil: 'Rich loamy soil with neutral pH',
      gestationPeriodDays: 330,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60',
    },
  });

  const chilli = await prisma.crop.create({
    data: {
      name: 'Green Chilli',
      category: 'SPICES',
      variety: 'G4 / Bullet Super Hot',
      description: 'Pungent, glossy green chillies with high disease resistance and market demand.',
      season: 'KHARIF',
      idealSoil: 'Black and light red loam soils',
      gestationPeriodDays: 120,
      imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=60',
    },
  });

  const onion = await prisma.crop.create({
    data: {
      name: 'Red Onion',
      category: 'VEGETABLES',
      variety: 'Nasik Red / Bellary Medium',
      description: 'Pungent globose red bulbs with tight outer skin and superior storage qualities.',
      season: 'RABI',
      idealSoil: 'Deep friable fertile loam',
      gestationPeriodDays: 110,
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60',
    },
  });

  const paddy = await prisma.crop.create({
    data: {
      name: 'Paddy (Rice)',
      category: 'GRAINS',
      variety: 'BPT 5204 (Samba Mahsuri)',
      description: 'Premium fine-grain aromatic non-basmati rice with high milling recovery.',
      season: 'KHARIF',
      idealSoil: 'Heavy clay and alluvial soil with good water retention',
      gestationPeriodDays: 140,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    },
  });

  // --------------------------------------------------------
  // 2. USERS & PROFILES
  // --------------------------------------------------------
  console.log('👤 Creating User Accounts...');
  const farmerUser = await prisma.user.create({
    data: {
      email: 'farmer@agriconnect.ai',
      phone: '9876543210',
      name: 'Ramesh Kumar',
      passwordHash: farmerPassword,
      role: 'FARMER',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  });

  const farmerProfile = await prisma.farmerProfile.create({
    data: {
      userId: farmerUser.id,
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      village: 'Kinathukadavu',
      farmLocation: 'SF No. 142/2, Kinathukadavu West',
      landAreaAcre: 5.5,
      soilType: 'Red Loam',
      irrigationType: 'Borewell + Micro-Drip',
      mainCrops: 'Tomato, Banana, Green Chilli',
      kycStatus: 'VERIFIED',
    },
  });

  const farm = await prisma.farm.create({
    data: {
      farmerProfileId: farmerProfile.id,
      farmName: 'Ramesh Green Meadows Farm',
      location: 'Kinathukadavu, Coimbatore, Tamil Nadu',
      latitude: 10.8245,
      longitude: 76.9982,
      landAreaAcre: 5.5,
      soilType: 'Red Loam',
      irrigation: 'Drip System',
      crops: 'Tomato, Green Chilli, Banana',
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@agriconnect.ai',
      phone: '9876543211',
      name: 'Suresh Krishnan (FreshMart)',
      passwordHash: buyerPassword,
      role: 'BUYER',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
  });

  await prisma.buyerProfile.create({
    data: {
      userId: buyerUser.id,
      companyName: 'FreshMart Agri Supply Chain Ltd',
      businessType: 'RETAILER',
      gstNumber: '33AABCF1234F1Z5',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      location: 'Ukkadam Agro Terminal, Coimbatore',
      requiredCrops: 'Tomato, Red Onion, Banana, Green Chilli',
      kycStatus: 'VERIFIED',
    },
  });

  const expertUser = await prisma.user.create({
    data: {
      email: 'expert@agriconnect.ai',
      phone: '9876543214',
      name: 'Dr. K. Swaminathan',
      passwordHash: expertPassword,
      role: 'EXPERT',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  });

  const expertProfile = await prisma.expertProfile.create({
    data: {
      userId: expertUser.id,
      title: 'Senior Agricultural Extension Specialist',
      institution: 'Tamil Nadu Agricultural University (TNAU) & ICAR',
      specialization: 'PLANT_PATHOLOGY',
      experienceYears: 16,
      languagesSpoken: 'Tamil, English',
      qualifications: 'Ph.D. Plant Pathology (TNAU Coimbatore)',
      bio: 'Leading crop disease diagnostic scientist specializing in solanaceous vegetables, bio-fungicides, and IPM pest control.',
      consultationFee: 0,
      isVerified: true,
      isAvailableNow: true,
      rating: 4.9,
      consultationsCount: 142,
    },
  });

  const govUser = await prisma.user.create({
    data: {
      email: 'gov@agriconnect.ai',
      phone: '9876543212',
      name: 'Anitha Selvam (Joint Director)',
      passwordHash: govPassword,
      role: 'GOVERNMENT_OFFICIAL',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    },
  });

  await prisma.governmentProfile.create({
    data: {
      userId: govUser.id,
      officialId: 'TN-AGRI-DIR-042',
      department: 'Department of Agricultural Marketing and Agri Business',
      designation: 'Joint Director of Agriculture',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@agriconnect.ai',
      phone: '9876543213',
      name: 'Namma Farm Platform Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
  });

  // Farmer Passport
  await prisma.farmerPassport.create({
    data: {
      farmerId: farmerUser.id,
      passportNumber: 'NF-TN-2026-8839',
      soilHealthIndex: 8.7,
      soilNPKStatus: 'Nitrogen: Medium | Phosphorus: High | Potassium: Optimal | pH: 6.8',
      totalCultivatedAcre: 5.5,
      primaryWaterSource: 'Borewell + Micro-Drip',
      creditRatingGrade: 'A+ (High Creditworthiness)',
      totalLifetimeSales: 485000,
      totalTransactions: 18,
      activeSchemesCount: 3,
      activeLoansCount: 1,
      insuranceCoverage: 350000,
      kycVerifiedDate: new Date(),
    },
  });

  // Trust Scores
  await prisma.trustScore.create({
    data: {
      userId: farmerUser.id,
      score: 92.0,
      verifiedIdentityScore: 25.0,
      completedOrdersScore: 35.0,
      ratingScore: 28.0,
      disputePenaltyScore: 0.0,
      explanation: 'Verified KYC, 18 successful farmgate transactions with 100% timely harvest delivery.',
    },
  });

  await prisma.trustScore.create({
    data: {
      userId: buyerUser.id,
      score: 94.0,
      verifiedIdentityScore: 25.0,
      completedOrdersScore: 35.0,
      ratingScore: 29.0,
      disputePenaltyScore: 0.0,
      explanation: 'Verified Corporate GSTIN, 100% prompt Escrow release within 2 hours of delivery.',
    },
  });

  // --------------------------------------------------------
  // 3. MARKETPLACE LISTINGS & ORDERS
  // --------------------------------------------------------
  console.log('📦 Creating Live Marketplace Crop Listings...');
  const tomatoListing = await prisma.cropListing.create({
    data: {
      farmerId: farmerUser.id,
      farmId: farm.id,
      cropId: tomato.id,
      variety: 'Hybrid Shivam (Grade A)',
      quantityKg: 3000,
      availableQuantityKg: 3000,
      unit: 'KG',
      expectedPricePerKg: 34.0,
      minAcceptablePrice: 30.0,
      harvestDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      qualityGrade: 'GRADE_A',
      description: 'Supermarket-grade firm red tomatoes. Fresh harvest scheduled in 4 days. Uniform size (60-70mm).',
      location: 'Kinathukadavu, Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      status: 'ACTIVE',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
            filename: 'tomato_harvest.jpg',
            isPrimary: true,
          },
        ],
      },
    },
  });

  const chilliListing = await prisma.cropListing.create({
    data: {
      farmerId: farmerUser.id,
      farmId: farm.id,
      cropId: chilli.id,
      variety: 'G4 Green Chilli (Grade A)',
      quantityKg: 800,
      availableQuantityKg: 800,
      unit: 'KG',
      expectedPricePerKg: 58.0,
      minAcceptablePrice: 52.0,
      harvestDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      qualityGrade: 'GRADE_A',
      description: 'Glossy dark green chillies, high pungency, zero chemical residues. Plucked directly into crates.',
      location: 'Kinathukadavu, Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      status: 'ACTIVE',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=60',
            filename: 'chilli_crop.jpg',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // --------------------------------------------------------
  // 4. GOVERNMENT SCHEMES (FEATURE 1)
  // --------------------------------------------------------
  console.log('🏛️ Seeding Government Schemes Hub...');
  const pmkisan = await prisma.governmentScheme.create({
    data: {
      code: 'PM-KISAN',
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      titleTamil: 'பிரதமர் கிசான் சம்மான் நிதி திட்டம் (PM-KISAN)',
      category: 'FINANCIAL_SUPPORT',
      level: 'CENTRAL',
      subsidyPct: 100,
      maxAmount: 6000,
      description: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.',
      descriptionTamil: 'அனைத்து விவசாயக் குடும்பங்களுக்கும் ஆண்டுக்கு ₹6,000 வீதம் 3 தவணைகளாக வங்கி கணக்கில் நேரடியாக செலுத்தப்படும் திட்டம்.',
      benefits: '• ₹6,000 direct bank transfer per year\n• 3 installments of ₹2,000 every 4 months\n• Direct Benefit Transfer (DBT) to Aadhaar-linked bank account\n• Full central government funding',
      eligibilityCriteria: 'All landholding farmer families with cultivable landholding in their names. Small and marginal farmers prioritized.',
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Land Record / Patta Chitta Copy', 'Bank Passbook Copy with IFSC', 'Mobile Number linked with Aadhaar']),
      applicationProcess: '1. Click Apply Now or visit PM-KISAN portal\n2. Enter Aadhaar number and land survey details\n3. Verify mobile OTP and bank account details\n4. Village Administrative Officer (VAO) verifies records\n5. Direct disbursement to bank account.',
      officialPortalUrl: 'https://pmkisan.gov.in',
      deadline: new Date('2026-12-31'),
    },
  });

  const pmfby = await prisma.governmentScheme.create({
    data: {
      code: 'PMFBY-2026',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY Crop Insurance)',
      titleTamil: 'பிரதமர் பயிர் காப்பீட்டுத் திட்டம் (PMFBY)',
      category: 'CROP_INSURANCE',
      level: 'CENTRAL',
      subsidyPct: 85,
      maxAmount: 150000,
      description: 'Comprehensive yield and crop loss insurance against non-preventable natural risks from pre-sowing to post-harvest.',
      descriptionTamil: 'இயற்கை சீற்றங்கள், பூச்சி தாக்குதல் மற்றும் பருவகால மாற்றங்களால் ஏற்படும் பயிர் இழப்புகளுக்கு முழுமையான இழப்பீடு வழங்கும் காப்பீட்டு திட்டம்.',
      benefits: '• Low premium: 2% for Kharif crops, 1.5% for Rabi crops, 5% for Horticulture/Commercial\n• 100% loss coverage against drought, flood, hailstorm, pest attack\n• Claim settlement within 21 days of loss assessment\n• Satellite & drone-based digital claim verification',
      eligibilityCriteria: 'All farmers growing notified crops in notified areas (including tenant and sharecropper farmers).',
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Land Title Document / Adangal', 'Crop Sowing Certificate by VAO', 'Bank Account Passbook']),
      applicationProcess: '1. Register policy before cut-off date\n2. Pay farmer share of premium (1.5% - 2%)\n3. Receive digital insurance policy number\n4. In case of crop loss, report within 72 hours via Namma Farm or Crop Insurance app.',
      officialPortalUrl: 'https://pmfby.gov.in',
      deadline: new Date('2026-11-30'),
    },
  });

  await prisma.governmentScheme.create({
    data: {
      code: 'SMAM-MACHINERY',
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      titleTamil: 'வேளாண் இயந்திரமயமாக்கல் திட்டம் (SMAM மானியம்)',
      category: 'FARM_MACHINERY',
      level: 'CENTRAL',
      subsidyPct: 50,
      maxAmount: 125000,
      description: 'Up to 50% capital subsidy on purchase of Tractors, Power Tillers, Combine Harvesters, Rotavators, and Agri Drones.',
      descriptionTamil: 'டிராக்டர், பவர் டில்லர், அறுவடை இயந்திரங்கள் மற்றும் ட்ரோன்களுக்கு 40% முதல் 50% வரை நேரடி அரசு மானியம்.',
      benefits: '• 40% to 50% subsidy for individual farmers\n• Up to 80% subsidy for Custom Hiring Centres (CHCs)\n• Special ₹1.25 Lakh subsidy on 45HP+ tractors\n• ₹5 Lakh subsidy on Agri Drone purchases for Farmer Producer Organizations (FPOs)',
      eligibilityCriteria: 'Individual farmers with active land holding. Special priority for SC/ST and Women farmers (extra 10% subsidy).',
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Land Ownership Records', 'Bank Passbook', 'Quotation from authorized machinery dealer', 'Farmer Passport / KYC']),
      applicationProcess: '1. Choose approved machinery model and dealer\n2. Submit online application with proforma invoice\n3. District Agriculture Engineer inspects and sanctions permit\n4. Purchase machinery and receive subsidy direct in bank account.',
      officialPortalUrl: 'https://agrimachinery.nic.in',
      deadline: new Date('2026-10-15'),
    },
  });

  await prisma.governmentScheme.create({
    data: {
      code: 'PMKSY-DRIP',
      title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY Micro-Irrigation)',
      titleTamil: 'நுண்ணீர்ப் பாசனத் திட்டம் (சொட்டு நீர் பாசன மானியம்)',
      category: 'IRRIGATION',
      level: 'STATE',
      state: 'Tamil Nadu',
      subsidyPct: 100,
      maxAmount: 85000,
      description: '100% subsidy for Small & Marginal Farmers and 75% subsidy for other farmers to install Drip and Sprinkler Irrigation systems.',
      descriptionTamil: 'சிறு மற்றும் குறு விவசாயிகளுக்கு 100% முழு மானியத்திலும், இதர விவசாயிகளுக்கு 75% மானியத்திலும் சொட்டு நீர் பாசனம் அமைக்கும் திட்டம்.',
      benefits: '• 100% Free Drip Irrigation for Small/Marginal farmers (up to 5 Acres)\n• 75% subsidy for Big farmers\n• 40% - 50% water savings + 30% yield boost\n• 7-year warranty on drippers, pipes, and control valves',
      eligibilityCriteria: 'Farmers with verified water source (borewell/well) and electricity connection or solar pump.',
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Patta & Chitta', 'FMB Sketch', 'Soil & Water Test Report', 'Electricity Bill / Solar Certificate']),
      applicationProcess: '1. Register application on Horticulture portal\n2. Company field engineer visits for survey and layout\n3. System installation and inspection by Assistant Director of Horticulture\n4. Payment settled directly to certified vendor.',
      officialPortalUrl: 'https://tnhorticulture.tn.gov.in',
      deadline: new Date('2026-12-31'),
    },
  });

  // Seed user application for PM-KISAN
  await prisma.schemeApplication.create({
    data: {
      schemeId: pmkisan.id,
      farmerId: farmerUser.id,
      applicationNumber: 'PMK-TN-2026-8821',
      applicantName: 'Ramesh Kumar',
      applicantPhone: '9876543210',
      landAreaAcre: 5.5,
      aadhaarLast4: '3210',
      bankAccountNumber: 'XXXXXX5892',
      ifscCode: 'SBIN0001234',
      village: 'Kinathukadavu',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      documentsSubmitted: JSON.stringify(['patta_chitta.pdf', 'aadhaar_card.pdf', 'bank_passbook.pdf']),
      status: 'APPROVED',
      officialRemarks: 'All land documents verified by VAO Kinathukadavu. Approved for DBT disbursement.',
      disbursedAmount: 6000,
      disbursedAt: new Date(),
    },
  });

  // --------------------------------------------------------
  // 5. GOVERNMENT ASSURED PRICE / MSP (FEATURE 2)
  // --------------------------------------------------------
  console.log('💰 Seeding Government MSP & Procurement Centers...');
  await prisma.mSPPrice.createMany({
    data: [
      {
        cropName: 'Paddy (Common)',
        variety: 'Common Grade',
        season: 'KHARIF',
        year: '2025-26',
        mspPerQuintal: 2300,
        mspPerKg: 23.0,
        prevYearMsp: 2183,
        costOfProduction: 1533,
        marginOverCostPct: 50.0,
        procurementAgency: 'FCI / TNCSC',
        isActive: true,
      },
      {
        cropName: 'Paddy (Grade A)',
        variety: 'Grade A Super Fine',
        season: 'KHARIF',
        year: '2025-26',
        mspPerQuintal: 2320,
        mspPerKg: 23.2,
        prevYearMsp: 2203,
        costOfProduction: 1533,
        marginOverCostPct: 51.3,
        procurementAgency: 'FCI / TNCSC',
        isActive: true,
      },
      {
        cropName: 'Cotton (Medium Staple)',
        variety: 'Medium Staple',
        season: 'KHARIF',
        year: '2025-26',
        mspPerQuintal: 7121,
        mspPerKg: 71.2,
        prevYearMsp: 6620,
        costOfProduction: 4747,
        marginOverCostPct: 50.0,
        procurementAgency: 'Cotton Corporation of India (CCI)',
        isActive: true,
      },
      {
        cropName: 'Maize (Corn)',
        variety: 'Hybrid Yellow',
        season: 'KHARIF',
        year: '2025-26',
        mspPerQuintal: 2225,
        mspPerKg: 22.25,
        prevYearMsp: 2090,
        costOfProduction: 1483,
        marginOverCostPct: 50.0,
        procurementAgency: 'NAFED / FCI',
        isActive: true,
      },
      {
        cropName: 'Tur / Arhar (Red Gram)',
        variety: 'Whole Pulses',
        season: 'KHARIF',
        year: '2025-26',
        mspPerQuintal: 7550,
        mspPerKg: 75.5,
        prevYearMsp: 7000,
        costOfProduction: 5033,
        marginOverCostPct: 50.0,
        procurementAgency: 'NAFED',
        isActive: true,
      },
      {
        cropName: 'Groundnut (in shell)',
        variety: 'Oilseed Pods',
        season: 'KHARIF',
        year: '2025-26',
        mspPerQuintal: 6783,
        mspPerKg: 67.83,
        prevYearMsp: 6377,
        costOfProduction: 4522,
        marginOverCostPct: 50.0,
        procurementAgency: 'NAFED',
        isActive: true,
      },
    ],
  });

  const procCenter1 = await prisma.procurementCenter.create({
    data: {
      centerName: 'FCI Central Grain Procurement Center - Coimbatore',
      agency: 'FCI (Food Corporation of India)',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      address: 'Near Goods Shed, Singanallur, Coimbatore - 641005',
      latitude: 11.0018,
      longitude: 77.0125,
      contactPerson: 'M. Selvaraj (Procurement Officer)',
      contactPhone: '9443218765',
      operatingHours: '8:30 AM - 5:30 PM (Mon-Sat)',
      acceptedCrops: JSON.stringify(['Paddy (Common)', 'Paddy (Grade A)', 'Maize (Corn)', 'Cotton (Medium Staple)']),
      dailyQuotaMT: 80.0,
      currentBookedMT: 32.0,
      isOpen: true,
    },
  });

  await prisma.procurementCenter.create({
    data: {
      centerName: 'TNCSC Direct Purchase Center (DPC) - Pollachi',
      agency: 'TNCSC (Tamil Nadu Civil Supplies Corp)',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      address: 'APMC Market Yard Complex, Pollachi Main Road - 642001',
      latitude: 10.6582,
      longitude: 77.0094,
      contactPerson: 'V. Sundaram (Assistant Manager)',
      contactPhone: '9842109876',
      operatingHours: '9:00 AM - 5:00 PM (Mon-Sat)',
      acceptedCrops: JSON.stringify(['Paddy (Common)', 'Paddy (Grade A)', 'Groundnut (in shell)']),
      dailyQuotaMT: 50.0,
      currentBookedMT: 18.5,
      isOpen: true,
    },
  });

  // Seed a sample procurement booking
  await prisma.procurementBooking.create({
    data: {
      farmerId: farmerUser.id,
      centerId: procCenter1.id,
      receiptNumber: 'MSP-REC-2026-9042',
      cropName: 'Paddy (Common)',
      quantityQuintals: 40,
      mspRatePerQuintal: 2300,
      totalMspPayout: 92000,
      slotDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'SCHEDULED',
      qualityGrade: 'FAQ (Fair Average Quality)',
      moisturePercentage: 14.2,
    },
  });

  // --------------------------------------------------------
  // 6. GOVERNMENT STORAGE FINDER (FEATURE 6)
  // --------------------------------------------------------
  console.log('🏭 Seeding Government Storage & Cold Warehouses...');
  const storage1 = await prisma.storageCenter.create({
    data: {
      name: 'Central Warehousing Corporation (CWC) Godown',
      agency: 'CWC (Central Warehousing Corporation)',
      type: 'DRY_GRAIN_GODOWN',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      address: 'Industrial Estate Post, Peelamedu, Coimbatore - 641004',
      latitude: 11.0267,
      longitude: 77.0182,
      contactPerson: 'R. K. Sharma (Regional Manager)',
      contactPhone: '0422-2578901',
      totalCapacityMT: 25000,
      availableMT: 8400,
      ratePerBagMonth: 8.5,
      ratePerTonMonth: 170.0,
      facilities: JSON.stringify(['Pest Management (Fumigation)', '24x7 Security & CCTV', 'Electronic Weighbridge (60T)', 'WDRA Certified Receipts', 'Fire Safety Sprinklers']),
      isWDRARegistered: true,
    },
  });

  await prisma.storageCenter.create({
    data: {
      name: 'Tamil Nadu SWC Controlled Cold Storage Facility',
      agency: 'SWC (State Warehousing Corporation)',
      type: 'COLD_STORAGE',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      address: 'Ukkadam Agro Terminal, Coimbatore - 641001',
      latitude: 10.9892,
      longitude: 76.9621,
      contactPerson: 'Dr. G. Natarajan',
      contactPhone: '0422-2394851',
      totalCapacityMT: 5000,
      availableMT: 1650,
      ratePerBagMonth: 28.0,
      ratePerTonMonth: 560.0,
      facilities: JSON.stringify(['Multi-Chamber Temperature Control (0°C to 12°C)', 'Humidity Control (85%-95%)', 'Ethylene Scrubber', 'Backup Diesel Generator 500kVA', 'Pre-cooling Chamber']),
      isWDRARegistered: true,
    },
  });

  // Seed sample storage booking
  await prisma.storageBooking.create({
    data: {
      farmerId: farmerUser.id,
      storageId: storage1.id,
      bookingRef: 'STR-BK-2026-4412',
      cropName: 'Red Onion',
      quantityBags: 60,
      quantityMT: 3.0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      estimatedCharges: 765.0,
      status: 'CONFIRMED',
      receiptNumber: 'NWR-CWC-2026-887',
      remarks: 'Stored in Chamber B-4 at optimal 65% RH. Goods verified dry and sound.',
    },
  });

  // --------------------------------------------------------
  // 7. TOLL-FREE & SUPPORT (FEATURE 7)
  // --------------------------------------------------------
  console.log('📞 Seeding Toll-Free Support System...');
  const ticket1 = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-2026-1049',
      userId: farmerUser.id,
      category: 'SCHEME_SUPPORT',
      priority: 'MEDIUM',
      subject: 'Assistance required for PMKSY Drip Irrigation layout survey',
      description: 'Applied for PMKSY 100% drip subsidy for 3 acres tomato field. Need site inspection schedule.',
      status: 'IN_PROGRESS',
      assignedTo: 'KVK Extension Agent Coimbatore',
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      senderId: farmerUser.id,
      senderType: 'USER',
      message: 'Hello, I submitted my application PMKSY-DRIP. Could you please confirm when the field engineer will visit Kinathukadavu?',
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      senderId: govUser.id,
      senderType: 'SUPPORT_AGENT',
      message: 'Dear Ramesh Kumar, your application has been verified. Field engineer Mr. Vignesh will visit your farm on Thursday at 10:30 AM.',
    },
  });

  // --------------------------------------------------------
  // 8. HYPERLOCAL WEATHER & SMART IRRIGATION (FEATURES 8 & 9)
  // --------------------------------------------------------
  console.log('🌦️ Seeding Hyperlocal Weather & Irrigation Advisories...');
  await prisma.weatherData.create({
    data: {
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      temperature: 30.5,
      humidity: 68,
      rainfallMm: 0.0,
      rainProbability: 25.0,
      windSpeedKmh: 14.2,
      condition: 'Partly Cloudy',
      forecastDays: JSON.stringify([
        { day: 'Mon', temp: 31, condition: 'Sunny', rainProb: 10 },
        { day: 'Tue', temp: 30, condition: 'Partly Cloudy', rainProb: 25 },
        { day: 'Wed', temp: 29, condition: 'Light Rain', rainProb: 65 },
        { day: 'Thu', temp: 28, condition: 'Showers', rainProb: 80 },
        { day: 'Fri', temp: 30, condition: 'Sunny', rainProb: 15 },
        { day: 'Sat', temp: 32, condition: 'Sunny', rainProb: 10 },
        { day: 'Sun', temp: 31, condition: 'Clear', rainProb: 10 },
      ]),
      agroAdvisory: 'Light scattered showers predicted for Wednesday and Thursday. Postpone prophylactic pesticide sprays to Friday. Favorable conditions for vegetable transplanting.',
      isDemoData: false,
    },
  });

  await prisma.irrigationAdvisory.create({
    data: {
      farmerId: farmerUser.id,
      cropName: 'Tomato',
      soilType: 'Red Loam',
      growthStage: 'Flowering to Fruit Formation',
      landAreaAcre: 3.0,
      waterSource: 'Borewell + Micro-Drip',
      dailyWaterReqLiters: 14500,
      nextIrrigationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      hoursRequired: 2.5,
      recommendationText: 'Apply 2.5 hours of drip irrigation in early morning (6:30 AM - 9:00 AM) to maintain root-zone soil moisture at 75% field capacity. Avoid evening watering to prevent fungal collar rot.',
      waterSavingTips: JSON.stringify(['Use 25-micron silver-black plastic mulch to reduce evaporative loss by 40%', 'Ensure inline drippers operate at 1.2 kg/cm² pressure', 'Add organic compost around plant base']),
      rainForecastMm: 12.5,
    },
  });

  // --------------------------------------------------------
  // 9. AI CROP CALENDAR (FEATURE 11)
  // --------------------------------------------------------
  console.log('📅 Seeding AI Crop Calendar & Stage Tasks...');
  const cropCal = await prisma.cropCalendar.create({
    data: {
      farmerId: farmerUser.id,
      cropName: 'Tomato',
      variety: 'Hybrid Shivam',
      sowingDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      expectedHarvest: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      landAreaAcre: 3.0,
      fieldLocation: 'Plot A (North Meadow)',
      status: 'ACTIVE',
    },
  });

  await prisma.calendarTask.createMany({
    data: [
      {
        calendarId: cropCal.id,
        stageName: 'Vegetative Stage (Day 25)',
        taskType: 'FERTILIZER',
        title: 'Top Dressing: Nitrogen & Potassium Fertigation',
        titleTamil: 'மேலுரம்: யூரியா மற்றும் பொட்டாஷ் சொட்டுநீர் உரமிடுதல்',
        description: 'Inject 19:19:19 water-soluble NPK fertilizer at 5 kg/acre through venturi drip system.',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isCompleted: true,
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        dosageOrGuidance: '5 kg / Acre (19:19:19 NPK)',
      },
      {
        calendarId: cropCal.id,
        stageName: 'Flowering Stage (Day 42)',
        taskType: 'PEST_CONTROL',
        title: 'Preventive Spray: Bio-neem & Yellow Sticky Traps',
        titleTamil: 'பூச்சி கட்டுப்பாடு: வேப்ப எண்ணெய் தெளிப்பு & ஒட்டும் பொறிகள்',
        description: 'Install 15 yellow sticky traps per acre for whitefly surveillance. Spray 0.5% azadirachtin neem oil emulsion.',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        dosageOrGuidance: '5 ml / Liter Neem Oil + 15 Traps/Acre',
      },
      {
        calendarId: cropCal.id,
        stageName: 'Fruit Set Stage (Day 60)',
        taskType: 'FERTILIZER',
        title: 'Calcium Nitrate & Boron Spray for Fruit Firmness',
        titleTamil: 'கால்சியம் போரான் நுண்ணூட்ட தெளிப்பு (காய் வெடிப்பு தடுப்பு)',
        description: 'Foliar spray of Calcium Nitrate (10g/L) + Boron 20% (1g/L) to prevent blossom end rot and fruit cracking.',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        dosageOrGuidance: '10g Calcium Nitrate + 1g Boron per liter water',
      },
      {
        calendarId: cropCal.id,
        stageName: 'Harvesting Stage (Day 90)',
        taskType: 'HARVESTING',
        title: 'First Picking & Farmgate Grading',
        titleTamil: 'முதல் அறுவடை மற்றும் தரம் பிரித்தல்',
        description: 'Pluck fruit at breaker stage (pink blush) in morning hours. Sort into Grade A supermarket crates.',
        dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        dosageOrGuidance: 'Grade A: 60-70mm uniform size, flawless skin',
      },
    ],
  });

  // --------------------------------------------------------
  // 10. FARM EQUIPMENT RENTAL (FEATURE 12)
  // --------------------------------------------------------
  console.log('🚜 Seeding Farm Equipment Rental Directory...');
  const tractor1 = await prisma.equipment.create({
    data: {
      ownerName: 'Coimbatore Custom Hiring Centre (CHC)',
      ownerPhone: '9443123456',
      name: 'Mahindra 575 DI Tractor (45 HP) with Rotavator',
      category: 'TRACTOR',
      hourlyRate: 850.0,
      dailyRate: 6000.0,
      acreRate: 1100.0,
      location: 'Kinathukadavu Main Road',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      specifications: '45 HP, 4-Cylinder Turbo Engine, Shaktiman 42-Blade Rotavator + 9-Tyne Cultivator included.',
      imageUrl: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      rating: 4.9,
      totalBookingsCount: 38,
    },
  });

  await prisma.equipment.create({
    data: {
      ownerName: 'Tamil Nadu Agro Drone Services',
      ownerPhone: '9843201982',
      name: 'DJI Agras T40 Smart Agricultural Spray Drone',
      category: 'SPRAYER_DRONE',
      hourlyRate: 1200.0,
      dailyRate: 8500.0,
      acreRate: 450.0,
      location: 'Pollachi Road, Eachanari, Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      specifications: '40-Liter payload, precision centrifugal atomizing spray, covers 1 acre in 6 minutes with zero crop trampling.',
      imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      rating: 5.0,
      totalBookingsCount: 52,
    },
  });

  await prisma.equipment.create({
    data: {
      ownerName: 'Pioneer Harvester Services',
      ownerPhone: '9442008811',
      name: 'Kubota DC-68G Multi-Crop Combine Harvester',
      category: 'HARVESTER',
      hourlyRate: 2200.0,
      dailyRate: 16000.0,
      acreRate: 2400.0,
      location: 'Sulur Agro Hub, Coimbatore',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      specifications: '68 HP Diesel Engine, Rubber crawler tracks for wet paddy/maize fields, 99.2% grain recovery rate.',
      imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      rating: 4.8,
      totalBookingsCount: 29,
    },
  });

  // Seed sample equipment booking
  await prisma.equipmentBooking.create({
    data: {
      bookingNumber: 'EQ-BK-2026-7731',
      equipmentId: tractor1.id,
      farmerId: farmerUser.id,
      rentalType: 'PER_ACRE',
      unitsBooked: 3.0,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      totalAmount: 3300.0,
      farmAddress: 'Plot B, Kinathukadavu West',
      status: 'BOOKED',
      operatorIncluded: true,
      notes: 'Need rotavator tilling for second season vegetable beds.',
    },
  });

  // --------------------------------------------------------
  // 11. SMART TRANSPORT (FEATURE 14)
  // --------------------------------------------------------
  console.log('🚚 Seeding Smart Transport Vehicles & Freight...');
  const vehicle1 = await prisma.transportVehicle.create({
    data: {
      driverName: 'K. Palanisamy',
      driverPhone: '9842512345',
      vehicleType: 'MINI_TRUCK_TATA_ACE',
      vehicleNumber: 'TN 38 BR 4022',
      capacityTons: 1.5,
      basePrice: 400.0,
      perKmRate: 18.0,
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      currentLocation: 'Kinathukadavu Junction',
      isAvailable: true,
      rating: 4.9,
    },
  });

  await prisma.transportVehicle.create({
    data: {
      driverName: 'S. Murugesan',
      driverPhone: '9443556789',
      vehicleType: 'TRUCK_3TON',
      vehicleNumber: 'TN 37 CY 8812',
      capacityTons: 3.5,
      basePrice: 700.0,
      perKmRate: 26.0,
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      currentLocation: 'Pollachi Agro Yard',
      isAvailable: true,
      rating: 4.8,
    },
  });

  await prisma.transportBooking.create({
    data: {
      bookingNumber: 'TRP-BK-2026-3021',
      vehicleId: vehicle1.id,
      farmerId: farmerUser.id,
      pickupLocation: 'Ramesh Farm, Kinathukadavu',
      dropLocation: 'FreshMart Distribution Hub, Ukkadam, Coimbatore',
      distanceKm: 28.5,
      cargoDescription: '1500 kg Fresh Harvest Tomatoes in 60 plastic crates',
      weightTons: 1.5,
      pickupDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      estimatedCost: 913.0,
      status: 'REQUESTED',
    },
  });

  // --------------------------------------------------------
  // 12. FINANCE & LOANS (FEATURE 15)
  // --------------------------------------------------------
  console.log('🏦 Seeding Agricultural Finance & Loan Products...');
  const kccLoan = await prisma.agriLoanProduct.create({
    data: {
      bankName: 'State Bank of India (SBI)',
      loanName: 'SBI Kisan Credit Card (KCC) Crop Loan',
      code: 'SBI-KCC-2026',
      interestRatePct: 7.0,
      subventedRatePct: 4.0,
      maxAmount: 300000,
      tenureMonthsMax: 60,
      processingFee: 'Nil for loans up to ₹1.60 Lakhs',
      eligibility: 'All individual farmers, tenant farmers, oral lessees and sharecroppers.',
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Land Record / Patta Chitta & Adangal', 'Passport Size Photographs', 'No Dues Certificate from nearby banks']),
      features: JSON.stringify(['Effective 4% interest with Government 3% Prompt Repayment Incentive (PRI)', 'Collateral-free limit up to ₹1.60 Lakhs', 'ATM-enabled RuPay Kisan Card for easy withdrawals', 'Built-in crop insurance coverage under PMFBY']),
      officialApplyUrl: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card',
      isActive: true,
    },
  });

  await prisma.agriLoanProduct.create({
    data: {
      bankName: 'NABARD / Canara Bank',
      loanName: 'Agri-Infrastructure & Farm Mechanization Loan',
      code: 'NABARD-MECH-2026',
      interestRatePct: 8.4,
      subventedRatePct: 5.4,
      maxAmount: 1500000,
      tenureMonthsMax: 84,
      processingFee: '0.50% + GST',
      eligibility: 'Farmers owning minimum 3 acres of cultivable land with assured irrigation.',
      requiredDocuments: JSON.stringify(['Aadhaar Card & PAN Card', 'Land Title Deeds & 13-Year Encumbrance Certificate', 'Tractor/Machinery Proforma Invoice', '6 Months Bank Statement']),
      features: JSON.stringify(['Covers Tractor, Solar Pump, Cold Storage, Polyhouse construction', '3% interest subvention under Agriculture Infrastructure Fund (AIF)', 'Flexible repayment aligned with harvesting season']),
      officialApplyUrl: 'https://canarabank.com/agricultural-banking',
      isActive: true,
    },
  });

  await prisma.loanApplication.create({
    data: {
      applicationNumber: 'LN-APP-2026-5591',
      loanProductId: kccLoan.id,
      farmerId: farmerUser.id,
      requestedAmount: 200000,
      tenureMonths: 36,
      purpose: 'CROP_PRODUCTION',
      annualIncome: 380000,
      landAreaAcre: 5.5,
      pattaNumber: 'PATTA-142/2-KINATHU',
      aadhaarLast4: '3210',
      bankAccount: 'XXXXXX5892',
      ifscCode: 'SBIN0001234',
      status: 'APPROVED',
      approvedAmount: 200000,
      bankOfficerRemarks: 'Land documents and soil productivity verified. KCC Limit sanctioned at subvented 4% rate.',
    },
  });

  // --------------------------------------------------------
  // 13. CROP INSURANCE (FEATURE 16)
  // --------------------------------------------------------
  console.log('🛡️ Seeding Crop Insurance Products & Claims...');
  const insProd = await prisma.insuranceProduct.create({
    data: {
      schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY Kharif 2026)',
      providerName: 'Agriculture Insurance Company of India (AIC)',
      season: 'KHARIF',
      premiumRatePct: 2.0,
      coveredCrops: JSON.stringify(['Paddy (Rice)', 'Cotton', 'Maize', 'Groundnut', 'Tomato', 'Green Chilli', 'Red Onion']),
      coveredRisks: JSON.stringify(['Prevented Sowing/Planting Risk', 'Standing Crop Loss (Drought, Flood, Pest Attack)', 'Post-Harvest Losses (up to 14 days after harvest)', 'Localized Calamities (Hailstorm, Landslide, Inundation)']),
      claimSettlementAvg: 95.2,
      cutOffDate: new Date('2026-11-30'),
      isActive: true,
    },
  });

  await prisma.insurancePolicy.create({
    data: {
      policyNumber: 'POL-PMFBY-2026-9938',
      productId: insProd.id,
      farmerId: farmerUser.id,
      cropName: 'Tomato',
      season: 'KHARIF',
      year: '2026',
      landAreaAcre: 3.0,
      sumInsured: 120000.0,
      farmerPremiumPaid: 2400.0,
      govtSubsidyAmount: 9600.0,
      village: 'Kinathukadavu',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      surveyNumber: '142/2',
      status: 'ACTIVE',
    },
  });

  // --------------------------------------------------------
  // 14. COMMUNITY CONNECT (FEATURE 18)
  // --------------------------------------------------------
  console.log('👥 Seeding Community Connect Posts & Farmer Q&A...');
  const post1 = await prisma.communityPost.create({
    data: {
      authorId: farmerUser.id,
      category: 'FARMING_TIPS',
      title: 'Natural Bio-Fungicide Recipe that controlled Early Blight in my 3-acre tomato field!',
      content: 'Sharing a proven method recommended by TNAU scientists: Mix 5 liters sour butter-milk (pulicha mor) with 1 kg crushed neem leaves and 100g asafoetida (perungayam). Ferment for 4 days and spray @ 50ml per 10L water. Cleared 90% of concentric leaf spots in 5 days with zero chemical residue!',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
      likesCount: 24,
      commentsCount: 3,
      isPinned: true,
    },
  });

  await prisma.communityComment.create({
    data: {
      postId: post1.id,
      authorId: expertUser.id,
      content: 'Excellent observation Ramesh! The lactic acid bacteria in sour buttermilk paired with azadirachtin acts as a powerful bio-fungal barrier against Alternaria solani. Recommended to spray during morning hours.',
    },
  });

  await prisma.communityPost.create({
    data: {
      authorId: farmerUser.id,
      category: 'MARKET_DISCUSSION',
      title: 'Direct Farmgate selling vs Mandi auctions — My 1-year experience report',
      content: 'Earlier I used to lose 18-22% in Mandi deductions (broker commission, loading charges, hamali, and transit damage). Switching to direct buyer trade on Namma Farm saved me ~₹42,000 across 3 harvest cycles because buyers inspect and pick up directly from farmgate.',
      likesCount: 42,
      commentsCount: 5,
    },
  });

  // --------------------------------------------------------
  // 15. AGRICULTURAL WASTE & BIOMASS MARKET (FEATURE 20)
  // --------------------------------------------------------
  console.log('♻️ Seeding Agri Waste & Biomass Marketplace...');
  await prisma.agriWasteListing.createMany({
    data: [
      {
        farmerId: farmerUser.id,
        wasteType: 'PADDY_STRAW',
        title: 'Premium High-Dryness Paddy Straw Bales (Square Baled)',
        description: 'Clean, rain-protected square baled paddy straw from Samba Mahsuri harvest. Ideal for mushroom cultivation, bio-pellet production, and cattle feed.',
        quantityTons: 15.0,
        availableTons: 15.0,
        pricePerTon: 2400.0,
        suitableFor: 'MUSHROOM_CULTIVATION, BIO_FUEL, CATTLE_FEED',
        location: 'Kinathukadavu, Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=60',
        status: 'ACTIVE',
      },
      {
        farmerId: farmerUser.id,
        wasteType: 'COIR_PITH',
        title: 'Washed Organic Coconut Coir Pith / Cocopeat Blocks',
        description: 'Low EC (< 0.5 mS/cm) washed coconut coir pith. High water retention (800%), perfect for nursery potting soil, greenhouse hydroponics, and vermicompost.',
        quantityTons: 8.0,
        availableTons: 8.0,
        pricePerTon: 3800.0,
        suitableFor: 'COMPOSTING, NURSERY_POTTING, HYDROPONICS',
        location: 'Pollachi Agro Belt, Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60',
        status: 'ACTIVE',
      },
      {
        farmerId: farmerUser.id,
        wasteType: 'SUGARCANE_BAGASSE',
        title: 'Dry Sugarcane Bagasse Biomass for Biofuel & Composting',
        description: 'Sun-dried sugarcane bagasse with low moisture content (under 12%). High calorific value for industrial boilers and bio-energy plants.',
        quantityTons: 25.0,
        availableTons: 25.0,
        pricePerTon: 1800.0,
        suitableFor: 'BIO_FUEL, PAPER_PULP, COMPOSTING',
        location: 'Udumalpet Road, Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        status: 'ACTIVE',
      },
    ],
  });

  // --------------------------------------------------------
  // 16. DIRECT EXPERT CONSULTATIONS (FEATURE 22)
  // --------------------------------------------------------
  console.log('🔬 Seeding Direct Expert Consultations & Appointments...');
  await prisma.expertAvailability.createMany({
    data: [
      { expertId: expertProfile.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '13:00', isAvailable: true },
      { expertId: expertProfile.id, dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '14:00', isAvailable: true },
      { expertId: expertProfile.id, dayOfWeek: 'FRIDAY', startTime: '14:00', endTime: '18:00', isAvailable: true },
    ],
  });

  const consult1 = await prisma.expertConsultation.create({
    data: {
      consultationNumber: 'EXP-CON-2026-1082',
      farmerId: farmerUser.id,
      expertId: expertUser.id,
      expertProfileId: expertProfile.id,
      topic: 'PEST_DISEASE_DIAGNOSIS',
      cropName: 'Tomato',
      problemSummary: 'Observed circular target-like brown spots on lower leaves with yellow halos.',
      cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      scheduledSlot: '10:30 AM - 11:00 AM',
      status: 'COMPLETED',
      prescriptionAdvice: 'Diagnosis: Early Blight (Alternaria solani).\nRecommended Treatment: Prune lower infected leaves up to 15cm from soil. Apply Trichoderma harzianum @ 5g/L or copper oxychloride 50 WP @ 2.5g/L as spray during dry morning hours.',
    },
  });

  await prisma.expertReview.create({
    data: {
      expertProfileId: expertProfile.id,
      farmerId: farmerUser.id,
      rating: 5,
      feedback: 'Dr. Swaminathan explained the root cause clearly and the bio-fungicide prescription resolved the issue completely without chemical burns!',
    },
  });

  // --------------------------------------------------------
  // 17. NOTIFICATIONS & PREFERENCES (FEATURE 21)
  // --------------------------------------------------------
  console.log('🔔 Seeding Smart Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: farmerUser.id,
        title: '📈 Tomato Price Surge Alert (+14%)',
        message: 'Coimbatore wholesale mandi prices jumped to ₹34/kg due to reduced arrivals. Great selling window!',
        type: 'PRICE_ALERT',
        isRead: false,
      },
      {
        userId: farmerUser.id,
        title: '🏛️ PM-KISAN 19th Installment Credited',
        message: 'Your application PMK-TN-2026-8821 was approved and ₹2,000 has been credited to your bank account.',
        type: 'SCHEME_ALERT',
        isRead: false,
      },
      {
        userId: farmerUser.id,
        title: '🌦️ Agro Weather Warning: Mid-Week Showers',
        message: 'Light to moderate rain expected on Wednesday/Thursday. Delay fertilizer top-dressing until Friday.',
        type: 'WEATHER_ALERT',
        isRead: true,
      },
      {
        userId: farmerUser.id,
        title: '🚜 Equipment Booking Confirmed',
        message: 'Mahindra 45HP Tractor booking EQ-BK-2026-7731 confirmed for Thursday morning at Kinathukadavu.',
        type: 'CALENDAR_TASK',
        isRead: true,
      },
    ],
  });

  await prisma.notificationPreference.create({
    data: {
      userId: farmerUser.id,
      priceAlerts: true,
      weatherAlerts: true,
      schemeAlerts: true,
      calendarTasks: true,
      buyerOffers: true,
      communityUpdates: true,
      smsEnabled: false,
      emailEnabled: true,
    },
  });

  console.log('✅ Namma Farm database seeding successfully completed for all 22 features!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
