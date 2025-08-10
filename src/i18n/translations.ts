export interface Translation {
  // Header
  servicehub: string;
  signin: string;
  
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    findServices: string;
    becomePro: string;
    verifiedSpecialists: string;
  };
  
  // How It Works
  howItWorks: {
    title: string;
    subtitle: string;
    searchCompare: {
      title: string;
      description: string;
    };
    getQuotes: {
      title: string;
      description: string;
    };
    securePayment: {
      title: string;
      description: string;
    };
  };
  
  // Popular Services
  popularServices: {
    title: string;
    subtitle: string;
  };
  
  // Categories
  categories: {
    plumbing: string;
    electrical: string;
    cleaning: string;
    locksmith: string;
    painting: string;
    gardening: string;
    moving: string;
    repair: string;
  };
  
  // Auth Modal
  auth: {
    signin: string;
    createAccount: string;
    client: string;
    professional: string;
    clientDescription: string;
    professionalDescription: string;
    forClients: string;
    forProfessionals: string;
    fullName: string;
    fullNamePlaceholder: string;
    businessNamePlaceholder: string;
    phoneNumber: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    specialization: string;
    selectSpecialization: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    signUp: string;
    loading: string;
    proVerification: string;
    proVerificationDesc: string;
    proTerms: string;
  };
  
  // Dashboard
  dashboard: {
    welcomeBack: string;
    manageRequests: string;
    professionalDashboard: string;
    rating: string;
    verified: string;
    overview: string;
    settings: string;
    activeJobs: string;
    completed: string;
    tenders: string;
    spent: string;
    recentActivity: string;
  };
  
  // User Dashboard
  userDashboard: {
    createRequest: string;
    myJobs: string;
    myAuctions: string;
    instantBooking: {
      title: string;
      description: string;
      bookNow: string;
    };
    createAuction: {
      title: string;
      description: string;
      startAuction: string;
    };
    bookInstantService: string;
    serviceCategory: string;
    description: string;
    minBudget: string;
    maxBudget: string;
    preferredDateTime: string;
    bookService: string;
    cancel: string;
    projectDescription: string;
    budgetHint: string;
    budgetHintNote: string;
    availableFrom: string;
    availableUntil: string;
    createTender: string;
    quickActions: string;
    recentActivity: string;
    settings: string;
    overview: string;
    activeJobs: string;
    completed: string;
    tenders: string;
    spent: string;
    welcomeBack: string;
    manageRequests: string;
    viewDetails: string;
    leaveReview: string;
    contactProfessional: string;
    viewBids: string;
    selectWinner: string;
    messages: string;
    notifications: string;
    profileSettings: string;
    emailNotifications: string;
    smsNotifications: string;
    pushNotifications: string;
    saveChanges: string;
  };
  
  proDashboard: {
    availableJobs: string;
    auctions: string;
    wallet: string;
    profile: string;
    myActiveJobs: string;
    availableJobsInArea: string;
    availableAuctions: string;
    bidOnProjects: string;
    acceptJob: string;
    viewDetails: string;
    placeBid: string;
    walletBalance: string;
    availableForWithdrawal: string;
    withdrawFunds: string;
    pendingEarnings: string;
    fromOngoingJobs: string;
    fundsAvailableAfter: string;
    recentTransactions: string;
    platformFee: string;
    professionalProfile: string;
    serviceCategories: string;
    serviceRadius: string;
    serviceRadiusNote: string;
    professionalBio: string;
    professionalBioPlaceholder: string;
    updateProfile: string;
    verificationStatus: string;
    identityVerification: string;
    backgroundCheck: string;
    insurance: string;
    pending: string;
  };
  
  settings: {
    profileSettings: string;
    address: string;
    addressPlaceholder: string;
    saveChanges: string;
    notifications: string;
    emailNotifications: string;
    emailNotificationsDesc: string;
    smsNotifications: string;
    smsNotificationsDesc: string;
    pushNotifications: string;
    pushNotificationsDesc: string;
    marketingEmails: string;
    marketingEmailsDesc: string;
    privacy: string;
    profileVisibility: string;
    profileVisibilityDesc: string;
    public: string;
    private: string;
    showPhone: string;
    showPhoneDesc: string;
    showLocation: string;
    showLocationDesc: string;
    paymentMethods: string;
    expiresOn: string;
    edit: string;
    remove: string;
    addPaymentMethod: string;
    security: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    updatePassword: string;
    twoFactorAuth: string;
    twoFactorAuthDesc: string;
    enable: string;
    dangerZone: string;
    deactivateAccount: string;
    deactivateAccountDesc: string;
    deactivate: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    businessSettings: string;
    businessName: string;
    taxId: string;
    businessAddress: string;
    businessAddressPlaceholder: string;
    workingHours: string;
    custom: string;
    responseTime: string;
    minutes: string;
    hour: string;
    hours: string;
    pricingSettings: string;
    hourlyRate: string;
    minimumJob: string;
    emergencyRate: string;
    discounts: string;
    regularCustomers: string;
    bulkOrders: string;
    newJobAlerts: string;
    newJobAlertsDesc: string;
    paymentNotifications: string;
    paymentNotificationsDesc: string;
    reviewReminders: string;
    reviewRemindersDesc: string;
    taxLegal: string;
    vatNumber: string;
    taxRate: string;
    insuranceInfo: string;
    insuranceInfoPlaceholder: string;
    agreeToTerms: string;
  };
  
  notifications: {
    jobAccepted: string;
    jobAcceptedMessage: string;
    tenderWon: string;
    tenderWonMessage: string;
    fiveMinutesAgo: string;
    twoHoursAgo: string;
  };
  
  jobs: {
    fixLeakingTap: string;
    generalCleaning: string;
    installOutlets: string;
  };
  
  tenders: {
    housePainting: string;
    landscapeDesign: string;
  };
  
  professionals: {
    mikhailPetrov: string;
    annaVolkova: string;
    dmitryKozlov: string;
    sergeyIvanov: string;
    elenaSmirnova: string;
  };
  
  applications: {
    electricianMessage: string;
    quickServiceMessage: string;
  };
  
  forms: {
    createJobRequest: string;
    createTender: string;
    describeWork: string;
    describeProject: string;
    problemPhotos: string;
    projectPhotos: string;
    createRequest: string;
  };
  
  common: {
    new: string;
    offered: string;
    accepted: string;
    inProgress: string;
    done: string;
    disputed: string;
    cancelled: string;
    open: string;
    bafo: string;
    awarded: string;
    expired: string;
    pending: string;
    rejected: string;
    priceRange: string;
    customer: string;
    professional: string;
    location: string;
    created: string;
    posted: string;
    budgetHint: string;
    bidsReceived: string;
    bestBid: string;
    deadline: string;
    bids: string;
    loading: string;
    available: string;
    busy: string;
    online: string;
    response: string;
    contactNow: string;
    unavailable: string;
    viewAllProfessionals: string;
    clientReviews: string;
    whatClientsSay: string;
    readyToFind: string;
    joinThousands: string;
    createAccountFree: string;
    noHiddenFees: string;
    secure: string;
    fastSearch: string;
    availableNow: string;
    popularCategories: string;
    availableSpecialists: string;
    lookAtBest: string;
    currency: string;
    budget: string;
    scheduled: string;
    applications: string;
    viewApplications: string;
    details: string;
    professionalApplications: string;
    executionTime: string;
    availability: string;
    oneToTwoHours: string;
    twoToThreeHours: string;
    immediately: string;
    today: string;
    workExamples: string;
    work: string;
    accept: string;
    reject: string;
    message: string;
    viewBids: string;
    winner: string;
    creating: string;
    activity: {
      cleaningCompleted: string;
      applicationReceived: string;
      tenderAwarded: string;
      jobStarted: string;
      bidSubmitted: string;
      paymentReceived: string;
      jobCompleted: string;
      twoHoursAgo: string;
      fourHoursAgo: string;
      oneDayAgo: string;
      twoDaysAgo: string;
    };
    agoTime: {
      minutes: string;
      hour: string;
      hours: string;
      days: string;
      week: string;
    };
    stats: {
      support247: string;
      satisfiedClients: string;
      averageRating: string;
    };
    professionals: Array<{
      name: string;
      category: string;
      specialties: string[];
      price: string;
      responseTime: string;
    }>;
    reviews: Array<{
      name: string;
      service: string;
      text: string;
      date: string;
    }>;
  };
}

export const translations: Record<'ro' | 'ru', Translation> = {
  ro: {
    servicehub: 'ServiceHub',
    signin: 'Conectare',
    
    hero: {
      title: 'Găsește Profesioniști de Încredere Lângă Tine',
      subtitle: 'Conectează-te cu furnizori de servicii verificați pentru toate nevoile tale de acasă și afaceri. Obține oferte instant sau creează licitații pentru cele mai bune oferte.',
      findServices: 'Găsește Servicii',
      becomePro: 'Devino Profesionist',
      verifiedSpecialists: 'Peste 10.000 de specialiști verificați'
    },
    
    howItWorks: {
      title: 'Cum Funcționează',
      subtitle: 'Modalitate simplă, rapidă și sigură de a te conecta cu profesioniștii',
      searchCompare: {
        title: 'Caută și Compară',
        description: 'Găsește profesioniști în zona ta, compară evaluările și citește recenziile altor clienți.'
      },
      getQuotes: {
        title: 'Obține Oferte',
        description: 'Rezervă instant sau creează licitații pentru a obține oferte competitive de la mai mulți profesioniști.'
      },
      securePayment: {
        title: 'Plată Sigură',
        description: 'Plătește în siguranță prin platforma noastră cu protecție integrată și rezolvarea disputelor.'
      }
    },
    
    popularServices: {
      title: 'Servicii Populare',
      subtitle: 'Profesioniști de încredere pentru toate nevoile tale'
    },
    
    categories: {
      plumbing: 'Instalații',
      electrical: 'Electricitate',
      cleaning: 'Curățenie',
      locksmith: 'Lăcătușerie',
      painting: 'Vopsitorie',
      gardening: 'Grădinărit',
      moving: 'Mutări',
      repair: 'Reparații'
    },
    
    auth: {
      signin: 'Conectare',
      createAccount: 'Creează Cont',
      client: 'Client',
      professional: 'Profesionist',
      clientDescription: 'Găsesc servicii',
      professionalDescription: 'Ofer servicii',
      forClients: 'pentru Clienți',
      forProfessionals: 'pentru Profesioniști',
      fullName: 'Nume Complet',
      fullNamePlaceholder: 'Introduceți numele complet',
      businessNamePlaceholder: 'Numele companiei sau profesionistului',
      phoneNumber: 'Numărul de Telefon',
      email: 'Email',
      emailPlaceholder: 'exemplu@email.com',
      password: 'Parolă',
      passwordPlaceholder: 'Introduceți parola',
      specialization: 'Specializarea',
      selectSpecialization: 'Selectați specializarea',
      dontHaveAccount: 'Nu ai cont? Înregistrează-te',
      alreadyHaveAccount: 'Ai deja cont? Conectează-te',
      signUp: 'Înregistrează-te',
      loading: 'Se încarcă...',
      proVerification: 'Verificare Profesională',
      proVerificationDesc: 'Contul va fi verificat în 24-48 ore pentru a confirma calificările.',
      proTerms: 'Prin înregistrare acceptați termenii pentru profesioniști'
    },
    
    dashboard: {
      welcomeBack: 'Bine ai revenit',
      manageRequests: 'Gestionează cererile de servicii și urmărește progresul',
      professionalDashboard: 'Panoul Profesionistului',
      rating: 'evaluare',
      verified: 'Verificat',
      overview: 'Prezentare generală',
      settings: 'Setări',
      activeJobs: 'Lucrări Active',
      completed: 'Finalizate',
      tenders: 'Licitații',
      spent: 'Cheltuit',
      recentActivity: 'Activitate recentă'
    },
    
    userDashboard: {
      createRequest: 'Creează Cerere',
      myJobs: 'Lucrările Mele',
      myAuctions: 'Licitațiile Mele',
      instantBooking: {
        title: 'Rezervare Instantă',
        description: 'Conectează-te cu profesioniști disponibili imediat. Perfect pentru nevoi urgente.',
        bookNow: 'Rezervă Acum'
      },
      createAuction: {
        title: 'Creează Licitație',
        description: 'Lasă profesioniștii să concureze pentru proiectul tău. Obține cel mai bun preț și serviciu.',
        startAuction: 'Începe Licitația'
      },
      bookInstantService: 'Rezervă Serviciu Instant',
      serviceCategory: 'Categoria Serviciului',
      description: 'Descriere',
      minBudget: 'Buget Minim',
      maxBudget: 'Buget Maxim',
      preferredDateTime: 'Data/Ora Preferată',
      bookService: 'Rezervă Serviciul',
      cancel: 'Anulează',
      projectDescription: 'Descrierea Proiectului',
      budgetHint: 'Indiciu Buget',
      budgetHintNote: 'Opțional: ajută profesioniștii să pregătească oferte mai bune',
      availableFrom: 'Disponibil Din',
      availableUntil: 'Disponibil Până',
      createTender: 'Creează Licitație',
      quickActions: 'Acțiuni Rapide',
      recentActivity: 'Activitate Recentă',
      settings: 'Setări',
      overview: 'Prezentare Generală',
      activeJobs: 'Lucrări Active',
      completed: 'Finalizate',
      tenders: 'Licitații',
      spent: 'Cheltuit',
      welcomeBack: 'Bine ai revenit',
      manageRequests: 'Gestionează cererile de servicii și urmărește progresul',
      viewDetails: 'Vezi Detalii',
      leaveReview: 'Lasă Recenzie',
      contactProfessional: 'Contactează Specialistul',
      viewBids: 'Vezi Ofertele',
      selectWinner: 'Selectează Câștigătorul',
      messages: 'Mesaje',
      notifications: 'Notificări',
      profileSettings: 'Setări Profil',
      emailNotifications: 'Notificări Email',
      smsNotifications: 'Notificări SMS',
      pushNotifications: 'Notificări Push',
      saveChanges: 'Salvează Modificările'
    },
    
    proDashboard: {
      availableJobs: 'Lucrări Disponibile',
      auctions: 'Licitații',
      wallet: 'Portofel',
      profile: 'Profil',
      myActiveJobs: 'Lucrările Mele Active',
      availableJobsInArea: 'Lucrări Disponibile în Zona Ta',
      availableAuctions: 'Licitații Disponibile',
      bidOnProjects: 'Licitează pentru proiecte și câștigă mai multă muncă',
      acceptJob: 'Acceptă Lucrarea',
      viewDetails: 'Vezi Detalii',
      placeBid: 'Plasează Ofertă',
      walletBalance: 'Soldul Portofelului',
      availableForWithdrawal: 'Disponibil pentru retragere',
      withdrawFunds: 'Retrage Fonduri',
      pendingEarnings: 'Câștiguri în Așteptare',
      fromOngoingJobs: 'Din lucrări în curs',
      fundsAvailableAfter: 'Fondurile vor fi disponibile după finalizarea lucrării',
      recentTransactions: 'Tranzacții Recente',
      platformFee: 'Taxa platformei',
      professionalProfile: 'Profilul Profesional',
      serviceCategories: 'Categorii de Servicii',
      serviceRadius: 'Raza de Serviciu (km)',
      serviceRadiusNote: 'Distanța maximă pe care ești dispus să o parcurgi',
      professionalBio: 'Biografia Profesională',
      professionalBioPlaceholder: 'Spune-le clienților despre experiența și expertiza ta...',
      updateProfile: 'Actualizează Profilul',
      verificationStatus: 'Starea Verificării',
      identityVerification: 'Verificarea Identității',
      backgroundCheck: 'Verificarea Antecedentelor',
      insurance: 'Asigurare',
      pending: 'În așteptare'
    },
    
    settings: {
      profileSettings: 'Setări Profil',
      address: 'Adresă',
      addressPlaceholder: 'Introduceți adresa completă',
      saveChanges: 'Salvează Modificările',
      notifications: 'Notificări',
      emailNotifications: 'Notificări Email',
      emailNotificationsDesc: 'Primește notificări despre activitatea contului',
      smsNotifications: 'Notificări SMS',
      smsNotificationsDesc: 'Primește SMS pentru actualizări importante',
      pushNotifications: 'Notificări Push',
      pushNotificationsDesc: 'Notificări în browser și aplicație',
      marketingEmails: 'Email-uri de Marketing',
      marketingEmailsDesc: 'Primește oferte speciale și promoții',
      privacy: 'Confidențialitate',
      profileVisibility: 'Vizibilitatea Profilului',
      profileVisibilityDesc: 'Cine poate vedea profilul tău',
      public: 'Public',
      private: 'Privat',
      showPhone: 'Afișează Telefonul',
      showPhoneDesc: 'Permite specialiștilor să vadă numărul tău',
      showLocation: 'Afișează Locația',
      showLocationDesc: 'Afișează locația aproximativă în profil',
      paymentMethods: 'Metode de Plată',
      expiresOn: 'Expiră pe',
      edit: 'Editează',
      remove: 'Elimină',
      addPaymentMethod: 'Adaugă Metodă de Plată',
      security: 'Securitate',
      changePassword: 'Schimbă Parola',
      currentPassword: 'Parola Curentă',
      newPassword: 'Parola Nouă',
      confirmPassword: 'Confirmă Parola',
      updatePassword: 'Actualizează Parola',
      twoFactorAuth: 'Autentificare cu Doi Factori',
      twoFactorAuthDesc: 'Adaugă un nivel suplimentar de securitate',
      enable: 'Activează',
      dangerZone: 'Zona Periculoasă',
      deactivateAccount: 'Dezactivează Contul',
      deactivateAccountDesc: 'Dezactivează temporar contul tău',
      deactivate: 'Dezactivează',
      deleteAccount: 'Șterge Contul',
      deleteAccountDesc: 'Șterge permanent contul și toate datele',
      businessSettings: 'Setări Afaceri',
      businessName: 'Numele Afacerii',
      taxId: 'ID Fiscal',
      businessAddress: 'Adresa Afacerii',
      businessAddressPlaceholder: 'Adresa completă a afacerii',
      workingHours: 'Orele de Lucru',
      custom: 'Personalizat',
      responseTime: 'Timpul de Răspuns',
      minutes: 'minute',
      hour: 'oră',
      hours: 'ore',
      pricingSettings: 'Setări Prețuri',
      hourlyRate: 'Tariful pe Oră',
      minimumJob: 'Lucrarea Minimă',
      emergencyRate: 'Tariful de Urgență',
      discounts: 'Reduceri',
      regularCustomers: 'Clienți Regulați',
      bulkOrders: 'Comenzi în Vrac',
      newJobAlerts: 'Alerte pentru Lucrări Noi',
      newJobAlertsDesc: 'Notificări despre lucrări disponibile',
      paymentNotifications: 'Notificări de Plată',
      paymentNotificationsDesc: 'Actualizări despre plăți și facturi',
      reviewReminders: 'Memento-uri pentru Recenzii',
      reviewRemindersDesc: 'Memento-uri pentru solicitarea recenziilor',
      taxLegal: 'Taxe și Juridic',
      vatNumber: 'Numărul TVA',
      taxRate: 'Rata de Impozitare',
      insuranceInfo: 'Informații despre Asigurare',
      insuranceInfoPlaceholder: 'Detalii despre asigurarea profesională',
      agreeToTerms: 'Sunt de acord cu termenii și condițiile'
    },
    
    notifications: {
      jobAccepted: 'Lucrarea acceptată!',
      jobAcceptedMessage: 'Specialistul Mihail Petrov a acceptat cererea ta pentru reparații instalații',
      tenderWon: 'Licitația câștigată!',
      tenderWonMessage: 'Licitația ta pentru vopsirea casei a fost câștigată de specialistul Elena Smirnova pentru 2200 lei',
      fiveMinutesAgo: 'acum 5 minute',
      twoHoursAgo: 'acum 2 ore'
    },
    
    jobs: {
      fixLeakingTap: 'Repară robinetul care curge din bucătărie',
      generalCleaning: 'Curățenie generală apartament 2 camere',
      installOutlets: 'Instalarea de prize noi în dormitor'
    },
    
    tenders: {
      housePainting: 'Vopsirea fațadei casei private',
      landscapeDesign: 'Amenajarea peisagistică a curții'
    },
    
    professionals: {
      mikhailPetrov: 'Mihail Petrov',
      annaVolkova: 'Ana Volkova',
      dmitryKozlov: 'Dmitri Kozlov',
      sergeyIvanov: 'Sergiu Ivanov',
      elenaSmirnova: 'Elena Smirnova'
    },
    
    applications: {
      electricianMessage: 'Salut! Sunt gata să execut instalarea prizelor calitativ și rapid. Am 8 ani de experiență în instalații electrice.',
      quickServiceMessage: 'Bună ziua! Pot executa lucrarea chiar astăzi. Toate materialele sunt disponibile.'
    },
    
    forms: {
      createJobRequest: 'Creează cerere de lucru',
      createTender: 'Creează licitație',
      describeWork: 'Descrie ce trebuie făcut...',
      describeProject: 'Descrie detaliat proiectul...',
      problemPhotos: 'Fotografii cu problema (opțional)',
      projectPhotos: 'Fotografii cu proiectul (opțional)',
      createRequest: 'Creează cererea'
    },
    
    common: {
      new: 'Nou',
      offered: 'Oferit',
      accepted: 'Acceptat',
      inProgress: 'În progres',
      done: 'Finalizat',
      disputed: 'Disputat',
      cancelled: 'Anulat',
      open: 'Deschis',
      bafo: 'BAFO',
      awarded: 'Acordat',
      expired: 'Expirat',
      pending: 'În așteptare',
      rejected: 'Respins',
      priceRange: 'Intervalul de Preț',
      customer: 'Client',
      professional: 'Profesionist',
      location: 'Locație',
      created: 'Creat',
      posted: 'Postat',
      budgetHint: 'Indiciu Buget',
      bidsReceived: 'Oferte Primite',
      bestBid: 'Cea Mai Bună Ofertă',
      deadline: 'Termen Limită',
      bids: 'oferte',
      loading: 'Se încarcă...',
      available: 'Disponibil',
      busy: 'Ocupat',
      online: 'Online',
      response: 'Răspuns prin',
      contactNow: 'Contactează acum',
      unavailable: 'Indisponibil',
      viewAllProfessionals: 'Vezi toți profesioniștii',
      clientReviews: 'Recenzii clienți',
      whatClientsSay: 'Ce spun clienții noștri',
      readyToFind: 'Gata să găsești specialistul perfect?',
      joinThousands: 'Alătură-te miilor de clienți mulțumiți și găsește un profesionist verificat chiar astăzi',
      createAccountFree: 'Creează cont gratuit',
      noHiddenFees: 'Fără taxe ascunse',
      secure: '100% sigur',
      fastSearch: 'Căutare rapidă',
      availableNow: 'Disponibili acum',
      popularCategories: 'Categorii populare',
      availableSpecialists: 'Specialiști disponibili chiar acum',
      lookAtBest: 'Privește la cei mai buni profesioniști și serviciile lor',
      currency: 'lei',
      budget: 'Buget',
      scheduled: 'Programat',
      applications: 'cereri',
      viewApplications: 'Vezi Cererile',
      details: 'Detalii',
      professionalApplications: 'Cereri de la Profesioniști',
      executionTime: 'Timp de Execuție',
      availability: 'Disponibilitate',
      oneToTwoHours: '1-2 ore',
      twoToThreeHours: '2-3 ore',
      immediately: 'Imediat',
      today: 'Astăzi',
      workExamples: 'Exemple de Lucrări',
      work: 'Lucrare',
      accept: 'Acceptă',
      reject: 'Respinge',
      message: 'Mesaj',
      viewBids: 'Vezi Ofertele',
      winner: 'Câștigător',
      creating: 'Se creează...',
      activity: {
        cleaningCompleted: 'Curățenie generală finalizată',
        applicationReceived: 'Cerere primită pentru instalarea prizelor',
        tenderAwarded: 'Licitația pentru vopsire a fost acordată',
        jobStarted: 'Lucrarea de înlocuire a boilerului a început',
        bidSubmitted: 'Ofertă trimisă pentru licitația de instalații',
        paymentReceived: 'Plată primită pentru curățenia apartamentului',
        jobCompleted: 'Instalarea prizelor finalizată',
        twoHoursAgo: 'acum 2 ore',
        fourHoursAgo: 'acum 4 ore',
        oneDayAgo: 'acum 1 zi',
        twoDaysAgo: 'acum 2 zile'
      },
      agoTime: {
        minutes: 'minute în urmă',
        hour: 'oră în urmă',
        hours: 'ore în urmă',
        days: 'zile în urmă',
        week: 'săptămână în urmă'
      },
      stats: {
        support247: 'Suport',
        satisfiedClients: 'Clienți mulțumiți',
        averageRating: 'Rating mediu'
      },
      professionals: [
        {
          name: 'Mihail Petrov',
          category: 'Instalații',
          specialties: ['Reparații țevi', 'Instalare sanitare', 'Apeluri urgente'],
          price: 'de la 200 lei/oră',
          responseTime: '15 min'
        },
        {
          name: 'Ana Volkova',
          category: 'Curățenie',
          specialties: ['Curățenie generală', 'Spălat geamuri', 'Curățare chimică'],
          price: 'de la 100 lei/oră',
          responseTime: '30 min'
        },
        {
          name: 'Dmitri Kozlov',
          category: 'Electricitate',
          specialties: ['Cablaj', 'Iluminat', 'Prize și întrerupătoare'],
          price: 'de la 240 lei/oră',
          responseTime: '2 ore'
        },
        {
          name: 'Elena Smirnova',
          category: 'Vopsitorie',
          specialties: ['Vopsit pereți', 'Finisaj decorativ', 'Fațade'],
          price: 'de la 160 lei/oră',
          responseTime: '1 oră'
        },
        {
          name: 'Sergiu Ivanov',
          category: 'Lăcătușerie',
          specialties: ['Încuietori', 'Chei', 'Deschidere urgentă'],
          price: 'de la 140 lei/oră',
          responseTime: '20 min'
        },
        {
          name: 'Maria Petrova',
          category: 'Grădinărit',
          specialties: ['Tăiat copaci', 'Peisagistică', 'Gazon'],
          price: 'de la 120 lei/oră',
          responseTime: '45 min'
        }
      ],
      reviews: [
        {
          name: 'Alexandru K.',
          service: 'Reparații instalații',
          text: 'Mihail a venit foarte repede și a remediat scurgerea calitativ. Preț corect, sunt mulțumit de muncă!',
          date: '2 zile în urmă'
        },
        {
          name: 'Olga M.',
          service: 'Curățenie generală',
          text: 'Ana a făcut o muncă incredibilă! Apartamentul strălucește de curățenie. Cu siguranță voi comanda din nou.',
          date: '1 săptămână în urmă'
        },
        {
          name: 'Igor S.',
          service: 'Instalații electrice',
          text: 'Dmitri este un profesionist în domeniul său. A instalat rapid prize și întrerupătoare noi. Recomand!',
          date: '3 zile în urmă'
        }
      ]
    }
  },
  
  ru: {
    servicehub: 'ServiceHub',
    signin: 'Войти',
    
    hero: {
      title: 'Найдите Проверенных Специалистов Рядом с Вами',
      subtitle: 'Свяжитесь с проверенными поставщиками услуг для всех ваших домашних и деловых потребностей. Получите мгновенные предложения или создайте аукционы для лучших предложений.',
      findServices: 'Найти Услуги',
      becomePro: 'Стать Специалистом',
      verifiedSpecialists: 'Более 10,000 проверенных специалистов'
    },
    
    howItWorks: {
      title: 'Как Это Работает',
      subtitle: 'Простой, быстрый и безопасный способ связаться со специалистами',
      searchCompare: {
        title: 'Поиск и Сравнение',
        description: 'Найдите специалистов в вашем районе, сравните рейтинги и прочитайте отзывы других клиентов.'
      },
      getQuotes: {
        title: 'Получить Предложения',
        description: 'Бронируйте мгновенно или создавайте аукционы для получения конкурентных предложений от нескольких специалистов.'
      },
      securePayment: {
        title: 'Безопасная Оплата',
        description: 'Платите безопасно через нашу платформу со встроенной защитой и разрешением споров.'
      }
    },
    
    popularServices: {
      title: 'Популярные Услуги',
      subtitle: 'Надежные специалисты для всех ваших потребностей'
    },
    
    categories: {
      plumbing: 'Сантехника',
      electrical: 'Электрика',
      cleaning: 'Уборка',
      locksmith: 'Слесарь',
      painting: 'Покраска',
      gardening: 'Садоводство',
      moving: 'Переезд',
      repair: 'Ремонт'
    },
    
    auth: {
      signin: 'Войти',
      createAccount: 'Создать Аккаунт',
      client: 'Клиент',
      professional: 'Специалист',
      clientDescription: 'Ищу услуги',
      professionalDescription: 'Предлагаю услуги',
      forClients: 'для Клиентов',
      forProfessionals: 'для Специалистов',
      fullName: 'Полное Имя',
      fullNamePlaceholder: 'Введите полное имя',
      businessNamePlaceholder: 'Название компании или специалиста',
      phoneNumber: 'Номер Телефона',
      email: 'Электронная Почта',
      emailPlaceholder: 'example@email.com',
      password: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      specialization: 'Специализация',
      selectSpecialization: 'Выберите специализацию',
      dontHaveAccount: 'Нет аккаунта? Зарегистрируйтесь',
      alreadyHaveAccount: 'Уже есть аккаунт? Войдите',
      signUp: 'Зарегистрироваться',
      loading: 'Загрузка...',
      proVerification: 'Профессиональная Верификация',
      proVerificationDesc: 'Аккаунт будет проверен в течение 24-48 часов для подтверждения квалификации.',
      proTerms: 'При регистрации вы принимаете условия для специалистов'
    },
    
    dashboard: {
      welcomeBack: 'Добро пожаловать',
      manageRequests: 'Управляйте запросами на услуги и отслеживайте прогресс',
      professionalDashboard: 'Панель Специалиста',
      rating: 'рейтинг',
      verified: 'Проверен',
      overview: 'Обзор',
      settings: 'Настройки',
      activeJobs: 'Активные Работы',
      completed: 'Завершенные',
      tenders: 'Тендеры',
      spent: 'Потрачено',
      recentActivity: 'Недавняя активность'
    },
    
    userDashboard: {
      createRequest: 'Создать Запрос',
      myJobs: 'Мои Работы',
      myAuctions: 'Мои Аукционы',
      instantBooking: {
        title: 'Мгновенное Бронирование',
        description: 'Свяжитесь с доступными специалистами немедленно. Идеально для срочных потребностей.',
        bookNow: 'Забронировать Сейчас'
      },
      createAuction: {
        title: 'Создать Аукцион',
        description: 'Позвольте специалистам конкурировать за ваш проект. Получите лучшую цену и сервис.',
        startAuction: 'Начать Аукцион'
      },
      bookInstantService: 'Забронировать Мгновенную Услугу',
      serviceCategory: 'Категория Услуги',
      description: 'Описание',
      minBudget: 'Минимальный Бюджет',
      maxBudget: 'Максимальный Бюджет',
      preferredDateTime: 'Предпочтительная Дата/Время',
      bookService: 'Забронировать Услугу',
      cancel: 'Отмена',
      projectDescription: 'Описание Проекта',
      budgetHint: 'Подсказка Бюджета',
      budgetHintNote: 'Необязательно: помогает специалистам подготовить лучшие предложения',
      availableFrom: 'Доступно С',
      availableUntil: 'Доступно До',
      createTender: 'Создать Тендер',
      quickActions: 'Быстрые Действия',
      recentActivity: 'Недавняя Активность',
      settings: 'Настройки',
      overview: 'Обзор',
      activeJobs: 'Активные Работы',
      completed: 'Завершенные',
      tenders: 'Тендеры',
      spent: 'Потрачено',
      welcomeBack: 'Добро пожаловать',
      manageRequests: 'Управляйте запросами на услуги и отслеживайте прогресс',
      viewDetails: 'Посмотреть Детали',
      leaveReview: 'Оставить Отзыв',
      contactProfessional: 'Связаться со Специалистом',
      viewBids: 'Посмотреть Предложения',
      selectWinner: 'Выбрать Победителя',
      messages: 'Сообщения',
      notifications: 'Уведомления',
      profileSettings: 'Настройки Профиля',
      emailNotifications: 'Email Уведомления',
      smsNotifications: 'SMS Уведомления',
      pushNotifications: 'Push Уведомления',
      saveChanges: 'Сохранить Изменения'
    },
    
    proDashboard: {
      availableJobs: 'Доступные Работы',
      auctions: 'Аукционы',
      wallet: 'Кошелек',
      profile: 'Профиль',
      myActiveJobs: 'Мои Активные Работы',
      availableJobsInArea: 'Доступные Работы в Вашем Районе',
      availableAuctions: 'Доступные Аукционы',
      bidOnProjects: 'Делайте ставки на проекты и выигрывайте больше работы',
      acceptJob: 'Принять Работу',
      viewDetails: 'Посмотреть Детали',
      placeBid: 'Сделать Ставку',
      walletBalance: 'Баланс Кошелька',
      availableForWithdrawal: 'Доступно для вывода',
      withdrawFunds: 'Вывести Средства',
      pendingEarnings: 'Ожидающие Доходы',
      fromOngoingJobs: 'От текущих работ',
      fundsAvailableAfter: 'Средства будут доступны после завершения работы',
      recentTransactions: 'Последние Транзакции',
      platformFee: 'Комиссия платформы',
      professionalProfile: 'Профессиональный Профиль',
      serviceCategories: 'Категории Услуг',
      serviceRadius: 'Радиус Обслуживания (км)',
      serviceRadiusNote: 'Максимальное расстояние, которое вы готовы преодолеть',
      professionalBio: 'Профессиональная Биография',
      professionalBioPlaceholder: 'Расскажите клиентам о своем опыте и экспертизе...',
      updateProfile: 'Обновить Профиль',
      verificationStatus: 'Статус Верификации',
      identityVerification: 'Верификация Личности',
      backgroundCheck: 'Проверка Биографии',
      insurance: 'Страхование',
      pending: 'В ожидании'
    },
    
    settings: {
      profileSettings: 'Настройки Профиля',
      address: 'Адрес',
      addressPlaceholder: 'Введите ваш полный адрес',
      saveChanges: 'Сохранить Изменения',
      notifications: 'Уведомления',
      emailNotifications: 'Email Уведомления',
      emailNotificationsDesc: 'Получать уведомления о активности аккаунта',
      smsNotifications: 'SMS Уведомления',
      smsNotificationsDesc: 'Получать SMS для важных обновлений',
      pushNotifications: 'Push Уведомления',
      pushNotificationsDesc: 'Уведомления в браузере и приложении',
      marketingEmails: 'Маркетинговые Email',
      marketingEmailsDesc: 'Получать специальные предложения и акции',
      privacy: 'Конфиденциальность',
      profileVisibility: 'Видимость Профиля',
      profileVisibilityDesc: 'Кто может видеть ваш профиль',
      public: 'Публичный',
      private: 'Приватный',
      showPhone: 'Показывать Телефон',
      showPhoneDesc: 'Разрешить специалистам видеть ваш номер',
      showLocation: 'Показывать Местоположение',
      showLocationDesc: 'Отображать примерное местоположение в профиле',
      paymentMethods: 'Способы Оплаты',
      expiresOn: 'Истекает',
      edit: 'Редактировать',
      remove: 'Удалить',
      addPaymentMethod: 'Добавить Способ Оплаты',
      security: 'Безопасность',
      changePassword: 'Изменить Пароль',
      currentPassword: 'Текущий Пароль',
      newPassword: 'Новый Пароль',
      confirmPassword: 'Подтвердить Пароль',
      updatePassword: 'Обновить Пароль',
      twoFactorAuth: 'Двухфакторная Аутентификация',
      twoFactorAuthDesc: 'Добавить дополнительный уровень безопасности',
      enable: 'Включить',
      dangerZone: 'Опасная Зона',
      deactivateAccount: 'Деактивировать Аккаунт',
      deactivateAccountDesc: 'Временно деактивировать ваш аккаунт',
      deactivate: 'Деактивировать',
      deleteAccount: 'Удалить Аккаунт',
      deleteAccountDesc: 'Навсегда удалить аккаунт и все данные',
      businessSettings: 'Настройки Бизнеса',
      businessName: 'Название Бизнеса',
      taxId: 'Налоговый ID',
      businessAddress: 'Адрес Бизнеса',
      businessAddressPlaceholder: 'Полный адрес бизнеса',
      workingHours: 'Рабочие Часы',
      custom: 'Настраиваемый',
      responseTime: 'Время Ответа',
      minutes: 'минут',
      hour: 'час',
      hours: 'часов',
      pricingSettings: 'Настройки Цен',
      hourlyRate: 'Почасовая Ставка',
      minimumJob: 'Минимальная Работа',
      emergencyRate: 'Тариф Срочности',
      discounts: 'Скидки',
      regularCustomers: 'Постоянные Клиенты',
      bulkOrders: 'Крупные Заказы',
      newJobAlerts: 'Уведомления о Новых Работах',
      newJobAlertsDesc: 'Уведомления о доступных работах',
      paymentNotifications: 'Уведомления о Платежах',
      paymentNotificationsDesc: 'Обновления о платежах и счетах',
      reviewReminders: 'Напоминания об Отзывах',
      reviewRemindersDesc: 'Напоминания о запросе отзывов',
      taxLegal: 'Налоги и Юридические',
      vatNumber: 'НДС Номер',
      taxRate: 'Налоговая Ставка',
      insuranceInfo: 'Информация о Страховке',
      insuranceInfoPlaceholder: 'Детали профессиональной страховки',
      agreeToTerms: 'Согласен с условиями и положениями'
    },
    
    notifications: {
      jobAccepted: 'Заявка принята!',
      jobAcceptedMessage: 'Специалист Михаил Петров принял вашу заявку на ремонт сантехники',
      tenderWon: 'Тендер выигран!',
      tenderWonMessage: 'Ваш тендер на покраску дома выиграл специалист Елена Смирнова за 2200 лей',
      fiveMinutesAgo: '5 минут назад',
      twoHoursAgo: '2 часа назад'
    },
    
    jobs: {
      fixLeakingTap: 'Починить протекающий кран на кухне',
      generalCleaning: 'Генеральная уборка 2-комнатной квартиры',
      installOutlets: 'Установка новых розеток в спальне'
    },
    
    tenders: {
      housePainting: 'Покраска фасада частного дома',
      landscapeDesign: 'Ландшафтный дизайн приусадебного участка'
    },
    
    professionals: {
      mikhailPetrov: 'Михаил Петров',
      annaVolkova: 'Анна Волкова',
      dmitryKozlov: 'Дмитрий Козлов',
      sergeyIvanov: 'Сергей Иванов',
      elenaSmirnova: 'Елена Смирнова'
    },
    
    applications: {
      electricianMessage: 'Здравствуйте! Готов выполнить установку розеток качественно и быстро. Имею 8 лет опыта в электромонтаже.',
      quickServiceMessage: 'Добрый день! Могу выполнить работу сегодня же. Все материалы есть в наличии.'
    },
    
    forms: {
      createJobRequest: 'Создать заявку на работу',
      createTender: 'Создать тендер',
      describeWork: 'Опишите что нужно сделать...',
      describeProject: 'Подробно опишите проект...',
      problemPhotos: 'Фото проблемы (опционально)',
      projectPhotos: 'Фото проекта (опционально)',
      createRequest: 'Создать заявку'
    },
    
    common: {
      new: 'Новый',
      offered: 'Предложен',
      accepted: 'Принят',
      inProgress: 'В процессе',
      done: 'Завершен',
      disputed: 'Спорный',
      cancelled: 'Отменен',
      open: 'Открыт',
      bafo: 'BAFO',
      awarded: 'Присужден',
      expired: 'Истек',
      pending: 'В ожидании',
      rejected: 'Отклонен',
      priceRange: 'Диапазон Цен',
      customer: 'Клиент',
      professional: 'Специалист',
      location: 'Местоположение',
      created: 'Создан',
      posted: 'Опубликован',
      budgetHint: 'Подсказка Бюджета',
      bidsReceived: 'Получено Предложений',
      bestBid: 'Лучшее Предложение',
      deadline: 'Крайний Срок',
      bids: 'предложений',
      loading: 'Загрузка...',
      available: 'Доступен',
      busy: 'Занят',
      online: 'Онлайн',
      response: 'Ответ через',
      contactNow: 'Связаться сейчас',
      unavailable: 'Недоступен',
      viewAllProfessionals: 'Посмотреть всех специалистов',
      clientReviews: 'Отзывы клиентов',
      whatClientsSay: 'Что говорят наши клиенты',
      readyToFind: 'Готовы найти идеального специалиста?',
      joinThousands: 'Присоединяйтесь к тысячам довольных клиентов и найдите проверенного профессионала уже сегодня',
      createAccountFree: 'Создать аккаунт бесплатно',
      noHiddenFees: 'Без скрытых платежей',
      secure: '100% безопасно',
      fastSearch: 'Быстрый поиск',
      availableNow: 'Доступны сейчас',
      popularCategories: 'Популярные категории',
      availableSpecialists: 'Доступные специалисты прямо сейчас',
      lookAtBest: 'Посмотрите на наших лучших профессионалов и их услуги',
      currency: 'лей',
      budget: 'Бюджет',
      scheduled: 'Запланировано',
      applications: 'заявок',
      viewApplications: 'Посмотреть заявки',
      details: 'Подробности',
      professionalApplications: 'Заявки специалистов',
      executionTime: 'Время выполнения',
      availability: 'Доступность',
      oneToTwoHours: '1-2 часа',
      twoToThreeHours: '2-3 часа',
      immediately: 'Немедленно',
      today: 'Сегодня',
      workExamples: 'Примеры работ',
      work: 'Работа',
      accept: 'Принять',
      reject: 'Отклонить',
      message: 'Написать',
      viewBids: 'Посмотреть предложения',
      winner: 'Победитель',
      creating: 'Создание...',
      activity: {
        cleaningCompleted: 'Генеральная уборка завершена',
        applicationReceived: 'Получена заявка на установку розеток',
        tenderAwarded: 'Тендер на покраску присужден',
        jobStarted: 'Начата работа по замене водонагревателя',
        bidSubmitted: 'Подана заявка на тендер по сантехнике',
        paymentReceived: 'Получен платеж за уборку квартиры',
        jobCompleted: 'Завершена установка розеток',
        twoHoursAgo: '2 часа назад',
        fourHoursAgo: '4 часа назад',
        oneDayAgo: '1 день назад',
        twoDaysAgo: '2 дня назад'
      },
      agoTime: {
        minutes: 'минут назад',
        hour: 'час назад',
        hours: 'часа назад',
        days: 'дня назад',
        week: 'неделю назад'
      },
      stats: {
        support247: 'Поддержка',
        satisfiedClients: 'Довольных клиентов',
        averageRating: 'Средний рейтинг'
      },
      professionals: [
        {
          name: 'Михаил Петров',
          category: 'Сантехника',
          specialties: ['Ремонт труб', 'Установка сантехники', 'Аварийные вызовы'],
          price: 'от 200 лей/час',
          responseTime: '15 мин'
        },
        {
          name: 'Анна Волкова',
          category: 'Уборка',
          specialties: ['Генеральная уборка', 'Мытье окон', 'Химчистка'],
          price: 'от 100 лей/час',
          responseTime: '30 мин'
        },
        {
          name: 'Дмитрий Козлов',
          category: 'Электрика',
          specialties: ['Проводка', 'Освещение', 'Розетки и выключатели'],
          price: 'от 240 лей/час',
          responseTime: '2 часа'
        },
        {
          name: 'Елена Смирнова',
          category: 'Покраска',
          specialties: ['Покраска стен', 'Декоративная отделка', 'Фасады'],
          price: 'от 160 лей/час',
          responseTime: '1 час'
        },
        {
          name: 'Сергей Иванов',
          category: 'Слесарь',
          specialties: ['Замки', 'Ключи', 'Аварийное вскрытие'],
          price: 'от 140 лей/час',
          responseTime: '20 мин'
        },
        {
          name: 'Мария Петрова',
          category: 'Садоводство',
          specialties: ['Обрезка деревьев', 'Ландшафт', 'Газоны'],
          price: 'от 120 лей/час',
          responseTime: '45 мин'
        }
      ],
      reviews: [
        {
          name: 'Александр К.',
          service: 'Ремонт сантехники',
          text: 'Михаил приехал очень быстро и качественно устранил протечку. Цена справедливая, работой доволен!',
          date: '2 дня назад'
        },
        {
          name: 'Ольга М.',
          service: 'Генеральная уборка',
          text: 'Анна сделала невероятную работу! Квартира сияет чистотой. Обязательно буду заказывать еще.',
          date: '1 неделю назад'
        },
        {
          name: 'Игорь С.',
          service: 'Электромонтаж',
          text: 'Дмитрий профессионал своего дела. Быстро установил новые розетки и выключатели. Рекомендую!',
          date: '3 дня назад'
        }
      ]
    }
  }
};