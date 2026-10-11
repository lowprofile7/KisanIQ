import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n, { LANGUAGE_STORAGE_KEY, supportedLanguages } from './i18n'
import {
  searchWeatherLocations,
  getWeather,
} from './api'
import {
  getCropRecommendations,
  getPersonalizedRecommendations,
} from './api'
import {
  Sprout,
  MapPin,
  CloudSun,
  Droplets,
  ArrowUpRight,
  Leaf,
  FlaskConical,
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Menu,
  Bell,
  Wheat,
  LayoutDashboard,
  History,
  UserRound,
  Sun,
  CalendarDays,
  ArrowRight,
  CircleHelp,
  X,
} from 'lucide-react'

const crops = [
  {
    id: 'soyabean',
    name: 'Soybean',
    localName: 'सोयाबीन',
    score: 94,
    price: '₹4,850',
    unit: '/quintal',
    tag: 'Best match',
    color: '#E5EDCF',
    icon: Sprout,
    description: 'Potentially suitable for your farm conditions.',
  },
  {
    id: 'cotton-lint',
    name: 'Cotton',
    localName: 'कपास',
    score: 87,
    price: '₹7,100',
    unit: '/quintal',
    tag: 'Good match',
    color: '#F1E8D7',
    icon: Leaf,
    description: 'Consider water availability and growing costs.',
  },
  {
    id: 'arhar-tur',
    name: 'Pigeon pea',
    localName: 'तूर',
    score: 82,
    price: '₹7,500',
    unit: '/quintal',
    tag: 'Worth exploring',
    color: '#E3EAE4',
    icon: Wheat,
    description: 'Compare crop duration and local demand.',
  },
]

const navItems = [
  { name: 'Home', icon: LayoutDashboard },
  { name: 'History', icon: History },
  { name: 'Ask KisanIQ', icon: MessageCircle },
  { name: 'Profile', icon: UserRound },
]

const t = (key, options) => i18n.t(key, options)

function translatedReason(reason) {
  const params = { ...(reason.params || {}) }
  if (params.soilType) params.soilType = t(`value.soil.${params.soilType}`)
  if (params.soilText) params.soilText = t(params.soilText)
  if (params.need) params.need = t(`value.water.${params.need}`)
  if (params.available) params.available = t(`value.water.${params.available}`)
  return t(reason.code, params)
}

function App() {
  const { i18n: translationInstance } = useTranslation()
  const [showLanguageWelcome, setShowLanguageWelcome] = useState(
    !supportedLanguages.some(({ code }) => code === window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
  )
  const [selectedLanguage, setSelectedLanguage] = useState(
    translationInstance.resolvedLanguage || 'en'
  )
  const [activeNav, setActiveNav] = useState('Home')
  const [showAllCrops, setShowAllCrops] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [recommendationResult, setRecommendationResult] = useState(null)
  const [recommendationLoading, setRecommendationLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState('')

  useEffect(() => {
    document.documentElement.lang = translationInstance.resolvedLanguage || 'en'
  }, [translationInstance.resolvedLanguage])

  async function changeLanguage(language) {
    if (!supportedLanguages.some(({ code }) => code === language)) return
    await translationInstance.changeLanguage(language)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    setSelectedLanguage(language)
  }

  async function continueToDashboard() {
    await changeLanguage(selectedLanguage)
    setShowLanguageWelcome(false)
  }

  async function handleRecommendationRequest(farmDetails, personalized = false) {
    setRecommendationLoading(true)
    setRecommendationError('')
    setRecommendationResult(null)

    try {
      const result = personalized
        ? await getPersonalizedRecommendations(farmDetails)
        : await getCropRecommendations(farmDetails)

      setRecommendationResult(result)
    } catch (error) {
      setRecommendationError(
        t(error.message || 'Unable to get recommendations. Please try again.')
      )
    } finally {
      setRecommendationLoading(false)
    }
  }

  if (showLanguageWelcome) {
    return (
      <LanguageWelcome
        selectedLanguage={selectedLanguage}
        onSelect={setSelectedLanguage}
        onContinue={continueToDashboard}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F0] text-[#202923]">
      <header className="sticky top-0 z-20 border-b border-[#E4E9DF] bg-[#F7F7F0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <button
            onClick={() => setActiveNav('Home')}
            className="flex items-center gap-3"
            aria-label={t('Go to home')}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#173F35] text-[#C5E86C]">
              <Sprout size={25} />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-tight">
                Kisan<span className="text-[#4F7D58]">IQ</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#788078]">
                {t('Smarter farming')}
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-[#E4E9DF] bg-white px-4 py-2.5 text-sm text-[#667267] md:flex">
            <MapPin size={16} className="text-[#4F7D58]" />
            <span>{t('Your farm location')}</span>
            <ChevronRight size={15} />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#E4E9DF] bg-white sm:flex"
              aria-label={t('Notifications')}
            >
              <Bell size={18} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5EDCF] text-[#173F35] md:hidden"
              aria-label={t('Toggle navigation')}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
              <button
                type="button"
                onClick={() => setActiveNav('Profile')}
                aria-label={t('Profile')}
                className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#DDE8D7] font-bold text-[#173F35] sm:flex"
              >
              F
              </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[#E4E9DF] bg-white px-5 py-3 md:hidden">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveNav(item.name)
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium hover:bg-[#F2F5EC]"
              >
                <item.icon size={18} />
                {t(item.name)}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
        {activeNav === 'Home' ? (
          <HomePage
            showAllCrops={showAllCrops}
            setShowAllCrops={setShowAllCrops}
            setActiveNav={setActiveNav}
          />
        ) : (
          <PlaceholderPage
             activeNav={activeNav}
              setActiveNav={setActiveNav}
              onRecommend={handleRecommendationRequest}
              recommendationResult={recommendationResult}
              recommendationLoading={recommendationLoading}
              recommendationError={recommendationError}
              selectedLanguage={selectedLanguage}
              onLanguageChange={changeLanguage}
          />
        )}
      </main>

      <footer className="mx-auto max-w-[1440px] px-5 pb-28 pt-4 text-center text-xs text-[#788078] sm:px-8 lg:px-12">
        {t('KisanIQ · Helping farmers make more informed decisions.')}
        <br />
        {t('Demonstration interface — sample data only.')}
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E4E9DF] bg-white/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeNav === item.name

            return (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`flex min-w-[66px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold ${
                  active
                    ? 'bg-[#EDF3E5] text-[#173F35]'
                    : 'text-[#788078]'
                }`}
              >
                <Icon size={20} />
                {t(item.name)}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function LanguageWelcome({ selectedLanguage, onSelect, onContinue }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F0] px-5 py-10 text-[#202923]">
      <section className="w-full max-w-xl rounded-[28px] border border-[#E4E9DF] bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#173F35] text-[#C5E86C]"><Sprout size={34} /></div>
        <h1 className="text-3xl font-extrabold tracking-tight">Kisan<span className="text-[#4F7D58]">IQ</span></h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#788078]">{t('Smarter farming')}</p>
        <h2 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">{t('Welcome to')} KisanIQ</h2>
        <p className="mt-3 text-sm leading-6 text-[#788078]">{t('Choose your preferred language to continue.')}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {supportedLanguages.map((language) => {
            const selected = selectedLanguage === language.code
            return <button key={language.code} type="button" aria-pressed={selected} onClick={() => onSelect(language.code)} className={`min-h-14 rounded-xl border px-4 py-3 text-base font-semibold transition ${selected ? 'border-[#4F7D58] bg-[#EDF3E5] text-[#173F35] ring-2 ring-[#C5E86C]' : 'border-[#E4E9DF] bg-white text-[#465348] hover:border-[#B6CDAA] hover:bg-[#F7F7F0]'}`}>{language.nativeLabel}{language.code !== 'en' && <span className="sr-only"> ({language.label})</span>}</button>
          })}
        </div>
        <button type="button" onClick={onContinue} className="mt-7 w-full rounded-xl bg-[#173F35] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#285B4B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F7D58] sm:w-auto sm:min-w-48">{t('Continue')}<ArrowRight className="ml-2 inline" size={18} /></button>
      </section>
    </main>
  )
}

function HomePage({ showAllCrops, setShowAllCrops, setActiveNav }) {
  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCE7D4] bg-white px-3 py-1.5 text-xs font-semibold text-[#4F7D58]">
            <span className="h-2 w-2 rounded-full bg-[#82A96A]" />
            {t('YOUR FARM, YOUR FUTURE')}
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t('Good day, farmer.')}
            <br />
            <span className="text-[#4F7D58]">{t("Let's grow smarter.")}</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#788078] sm:text-base">
            {t('Get personalized crop suggestions and make more informed farming decisions, one season at a time.')}
          </p>
        </div>

        <button
          onClick={() => setActiveNav('Profile')}
          className="flex w-fit items-center gap-2 rounded-xl border border-[#DCE4D7] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[#4F7D58]"
        >
          <MapPin size={17} className="text-[#4F7D58]" />
          {t('Set farm location')}
          <ArrowUpRight size={16} />
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WeatherCard />
        <OverviewCard
          icon={Droplets}
          label={t('Water availability')}
          value={t('Not set')}
          detail={t('Add your irrigation details')}
          iconBg="bg-[#E4EDF7]"
          iconColor="text-[#4778A6]"
        />
        <OverviewCard
          icon={FlaskConical}
          label={t('Soil health')}
          value={t('Not analysed')}
          detail={t('Upload your soil test report')}
          iconBg="bg-[#F2E8D8]"
          iconColor="text-[#9A7144]"
        />
        <OverviewCard
          icon={CalendarDays}
          label={t('Growing season')}
          value={t('Location needed')}
          detail={t('Personalize your crop calendar')}
          iconBg="bg-[#E5EDCF]"
          iconColor="text-[#4F7D58]"
        />
      </section>

      <section className="mb-8 overflow-hidden rounded-[28px] bg-[#173F35] text-white">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
          <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#D5E8BD]">
              <Sprout size={15} />
              {t('PERSONALIZED CROP PLANNING')}
            </div>
            <h3 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {t('The right crop can change your season.')}
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
              {t('Start with your soil, local weather, water supply and market information. Get crop options tailored to your farm.')}
            </p>
            <button
              onClick={() => setActiveNav('Recommendations')}
              className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#C5E86C] px-5 py-3.5 text-sm font-bold text-[#173F35] transition hover:bg-[#D4F38A]"
            >
              {t('Find recommended crops')}
              <ArrowRight size={18} />
            </button>
            <p className="mt-3 text-xs text-white/50">
              {t('Recommendations require your farm details.')}
            </p>
          </div>

          <div className="relative hidden min-h-[300px] items-center justify-center overflow-hidden lg:flex">
            <div className="absolute right-[-50px] top-[-70px] h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute right-[-5px] top-[-25px] h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute bottom-[-80px] left-10 h-72 w-72 rounded-full bg-[#4F7D58]/30 blur-2xl" />
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/20 bg-white/5">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#C5E86C] text-[#173F35]">
                <Sprout size={76} strokeWidth={1.2} />
              </div>
              <div className="absolute right-[-22px] top-5 rounded-2xl bg-white p-3 text-[#173F35] shadow-xl">
                <Leaf size={24} />
              </div>
              <div className="absolute bottom-3 left-[-28px] rounded-2xl bg-white p-3 text-[#173F35] shadow-xl">
                <Sun size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-8 xl:grid-cols-[1.6fr_0.8fr]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <SectionTitle
              eyebrow={t('MAKE INFORMED CHOICES')}
              title={t('Explore crop options')}
              subtitle={t('Compare suitability, market information and farming costs.')}
            />
            <button
              onClick={() => setShowAllCrops(!showAllCrops)}
              className="mb-1 flex shrink-0 items-center gap-1 text-sm font-semibold text-[#4F7D58]"
            >
              {showAllCrops ? t('Show less') : t('View all')}
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(showAllCrops ? crops : crops.slice(0, 2)).map((crop) => (
              <CropCard key={crop.name} crop={crop} />
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#788078]">
            {t('Example crops and prices are illustrative only. They are not verified local market quotations or personalized agronomic advice.')}
          </p>
        </div>

        <div>
          <SectionTitle
            eyebrow={t('YOUR NEXT STEPS')}
            title={t('Build your farm profile')}
            subtitle={t('A little information helps make recommendations more relevant.')}
          />
          <div className="mt-5 space-y-3">
            <QuickAction
              icon={FlaskConical}
              title={t('Add soil information')}
              description={t('Enter soil values or upload a report')}
              onClick={() => setActiveNav('Soil Analysis')}
            />
            <QuickAction
              icon={MessageCircle}
              title={t('Ask KisanIQ')}
              description={t('Explore farming questions')}
              onClick={() => setActiveNav('Ask KisanIQ')}
            />
            <QuickAction
              icon={History}
              title={t('Previous recommendations')}
              description={t('Review your saved decisions')}
              onClick={() => setActiveNav('History')}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E4E9DF] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF3E5] text-[#4F7D58]">
            <CircleHelp size={22} />
          </div>
          <div>
            <h3 className="font-bold">{t('Why farm details matter')}</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#788078]">
              {t("Soil properties, planting dates, water availability, local weather and verified market prices all affect a crop's suitability and potential profitability. KisanIQ should consider these factors together rather than rank crops on price alone.")}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function WeatherCard() {
  const [query, setQuery] = useState('')
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [weather, setWeather] = useState(null)

  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    if (query.trim().length < 2) {
      setError(t('Enter a village, town, or city name.'))
      return
    }

    setLoadingSearch(true)
    setError('')
    setLocations([])
    setWeather(null)
    setSelectedLocation(null)

    try {
      const results = await searchWeatherLocations(query.trim())
      setLocations(results)

      if (results.length === 0) {
        setError(t('No locations found. Try another name.'))
      }
    } catch (err) {
      setError(t(err.message || 'Unable to search locations.'))
    } finally {
      setLoadingSearch(false)
    }
  }

  async function handleSelectLocation(location) {
    setSelectedLocation(location)
    setLocations([])
    setWeather(null)
    setError('')
    setLoadingWeather(true)

    try {
      const result = await getWeather(
        location.latitude,
        location.longitude
      )

      setWeather(result)
    } catch (err) {
      setError(t(err.message || 'Unable to load weather.'))
    } finally {
      setLoadingWeather(false)
    }
  }

  function getWeatherDescription(code) {
    if (code === 0) return t('Clear sky')
    if ([1, 2].includes(code)) return t('Mostly clear')
    if (code === 3) return t('Cloudy')
    if ([45, 48].includes(code)) return t('Foggy')
    if ([51, 53, 55, 56, 57].includes(code)) return t('Drizzle')
    if ([61, 63, 65, 66, 67].includes(code)) return t('Rain')
    if ([71, 73, 75, 77].includes(code)) return t('Snow')
    if ([80, 81, 82].includes(code)) return t('Rain showers')
    if ([85, 86].includes(code)) return t('Snow showers')
    if ([95, 96, 99].includes(code)) return t('Thunderstorm')

    return t('Weather conditions unavailable')
  }

  function formatDay(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString(
      i18n.resolvedLanguage === 'hi' ? 'hi-IN' : i18n.resolvedLanguage === 'mr' ? 'mr-IN' : 'en-IN',
      { weekday: 'short', day: 'numeric', month: 'short' }
    )
  }

  const current = weather?.current
  const daily = weather?.daily

  return (
    <div className="rounded-2xl border border-[#E4E9DF] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-[#788078]">
            {t('Local weather')}
          </span>

          <h3 className="mt-1 text-lg font-bold text-[#244C36]">
            {t('Farm weather')}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EBD1] text-[#B38A35]">
          <CloudSun size={22} />
        </div>
      </div>

      {/* Location Search */}
      <form onSubmit={handleSearch} className="mt-4">
        <label
          htmlFor="weather-location"
          className="mb-2 block text-sm font-medium text-[#465348]"
        >
          {t('Enter your village or city')}
        </label>

        <div className="flex gap-2">
          <input
            id="weather-location"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('e.g. Nagpur, Maharashtra')}
            className="min-w-0 flex-1 rounded-xl border border-[#E4E9DF] bg-[#FAFBF8] px-3 py-2 text-sm outline-none focus:border-[#477653]"
          />

          <button
            type="submit"
            disabled={loadingSearch}
            className="rounded-xl bg-[#244C36] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#315F43] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingSearch ? t('Searching...') : t('Search')}
          </button>
        </div>
      </form>

      {/* Location Results */}
      {locations.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-[#788078]">
            {t('Select your location:')}
          </p>

          {locations.map((location, index) => (
            <button
              key={`${location.id ?? location.name}-${index}`}
              type="button"
              onClick={() => handleSelectLocation(location)}
              className="flex w-full items-start gap-2 rounded-xl border border-[#E4E9DF] p-3 text-left transition hover:bg-[#F3F7F0]"
            >
              <MapPin
                size={16}
                className="mt-0.5 shrink-0 text-[#477653]"
              />

              <span className="text-sm text-[#244C36]">
                <span className="block font-medium">
                  {location.name}
                </span>

                <span className="text-xs text-[#788078]">
                  {[
                    location.district,
                    location.state,
                    location.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Loading */}
      {loadingWeather && (
        <div className="mt-5 rounded-xl bg-[#F3F7F0] p-4 text-sm text-[#477653]">
          {t('Fetching weather for your location...')}
        </div>
      )}

      {/* Current Weather */}
      {current && selectedLocation && (
        <div className="mt-5">
          <div className="rounded-xl bg-[#F3F7F0] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#788078]">
                  {selectedLocation.name}
                  {selectedLocation.state
                    ? `, ${selectedLocation.state}`
                    : ''}
                </p>

                <h3 className="mt-2 text-4xl font-bold text-[#244C36]">
                  {Math.round(current.temperature_2m)}°C
                </h3>

                <p className="mt-1 text-sm text-[#465348]">
                  {getWeatherDescription(current.weather_code)}
                </p>
              </div>

              <CloudSun
                size={36}
                className="text-[#B38A35]"
              />
            </div>

            <p className="mt-3 text-xs text-[#788078]">
              {t('Feels like {{temperature}}°C', { temperature: Math.round(current.apparent_temperature) })}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-[#788078]">
                  {t('Humidity')}
                </p>

                <p className="mt-1 font-semibold text-[#244C36]">
                  {current.relative_humidity_2m}%
                </p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-[#788078]">
                  {t('Wind speed')}
                </p>

                <p className="mt-1 font-semibold text-[#244C36]">
                  {current.wind_speed_10m} km/h
                </p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-[#788078]">
                  {t('Current precipitation')}
                </p>

                <p className="mt-1 font-semibold text-[#244C36]">
                  {current.precipitation} mm
                </p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-[#788078]">
                  {t('Day / Night')}
                </p>

                <p className="mt-1 font-semibold text-[#244C36]">
                  {current.is_day ? t('Daytime') : t('Nighttime')}
                </p>
              </div>
            </div>
          </div>

          {/* Five-Day Forecast */}
          {daily && (
            <div className="mt-5">
              <h4 className="mb-3 font-semibold text-[#244C36]">
                {t('5-day forecast')}
              </h4>

              <div className="space-y-2">
                {daily.time.map((date, index) => (
                  <div
                    key={date}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#EEF0E8] p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#244C36]">
                        {formatDay(date)}
                      </p>

                      <p className="mt-1 text-xs text-[#788078]">
                        {getWeatherDescription(
                          daily.weather_code[index]
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#244C36]">
                        {Math.round(daily.temperature_2m_max[index])}°
                        {' / '}
                        {Math.round(daily.temperature_2m_min[index])}°C
                      </p>

                      <p className="mt-1 text-xs text-[#788078]">
                        {t('Rain: {{amount}} mm', { amount: daily.precipitation_sum[index] })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attribution */}
          <p className="mt-4 text-xs text-[#788078]">
            {t('Forecast data: Open-Meteo. Weather conditions can change.')}
          </p>

          <button
            type="button"
            onClick={() => {
              setWeather(null)
              setSelectedLocation(null)
              setLocations([])
              setError('')
            }}
            className="mt-3 text-sm font-medium text-[#477653] hover:underline"
          >
            {t('Change location')}
          </button>
        </div>
      )}

      {/* Initial State */}
      {!current && !loadingWeather && !error && (
        <div className="mt-4 flex items-center gap-2 border-t border-[#EEF0E8] pt-3 text-xs text-[#788078]">
          <MapPin size={14} />
          {t('Search for your farm location to view its weather.')}
        </div>
      )}
    </div>
  )
}

function OverviewCard({ icon: Icon, label, value, detail, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl border border-[#E4E9DF] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#788078]">{label}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={21} />
        </div>
      </div>
      <h3 className="mt-4 text-xl font-bold">{value}</h3>
      <p className="mt-1 text-xs leading-5 text-[#788078]">{detail}</p>
    </div>
  )
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4F7D58]">
        {eyebrow}
      </p>
      <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-[#788078]">{subtitle}</p>
    </div>
  )
}

function CropCard({ crop }) {
  const Icon = crop.icon

  return (
    <article className="rounded-2xl border border-[#E4E9DF] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-[#365A3F]"
            style={{ backgroundColor: crop.color }}
          >
            <Icon size={25} />
          </div>
          <div>
            <h4 className="font-bold">{t(`crop.${crop.id}`, { defaultValue: crop.name })}</h4>
            <p className="text-xs text-[#788078]">{t(`localCrop.${crop.id}`, { defaultValue: crop.localName })}</p>
          </div>
        </div>
        <span className="rounded-full bg-[#EDF3E5] px-2.5 py-1 text-[10px] font-bold text-[#4F7D58]">
          {t('Demo')}
        </span>
      </div>

      <div className="mt-5 rounded-xl bg-[#F7F7F0] p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#788078]">{t('Example suitability')}</span>
          <span className="text-sm font-bold text-[#365A3F]">{crop.score}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E4E9DF]">
          <div
            className="h-full rounded-full bg-[#4F7D58]"
            style={{ width: `${crop.score}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-[#788078]">{t('Example market price')}</p>
          <p className="mt-1 text-lg font-bold">{crop.price}</p>
          <p className="text-[10px] text-[#788078]">{t(crop.unit)}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-[#4F7D58]">
          <TrendingUp size={15} />
          {t('Illustrative')}
        </div>
      </div>

      <p className="mt-3 border-t border-[#EEF0E8] pt-3 text-xs leading-5 text-[#788078]">
        {t(crop.description)}
      </p>
    </article>
  )
}

function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-[#E4E9DF] bg-white p-4 text-left transition hover:border-[#B6CDAA] hover:shadow-sm"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF3E5] text-[#4F7D58]">
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="mt-1 text-xs leading-5 text-[#788078]">{description}</p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-[#788078] transition group-hover:translate-x-1"
      />
    </button>
  )
}

function PlaceholderPage({
  activeNav,
  setActiveNav,
  onRecommend,
  recommendationResult,
  recommendationLoading,
  recommendationError,
  selectedLanguage,
  onLanguageChange,
}) {
  const details = {
    Recommendations: {
      title: 'Crop recommendations',
      description:
        'Enter your farm details to explore crop options using our initial recommendation rules.',
      icon: Sprout,
      button: 'Back to dashboard',
      target: 'Home',
    },
    'Soil Analysis': {
      title: 'Personalized soil recommendations',
      description:
        'Enter your soil pH along with your farm details to receive a separate soil-based assessment.',
      icon: FlaskConical,
      button: 'Back to dashboard',
      target: 'Home',
    },
    'Ask KisanIQ': {
      title: 'Ask KisanIQ',
      description:
        'Your farming assistant will be connected to an AI service in a later development phase.',
      icon: MessageCircle,
      button: 'Back to dashboard',
      target: 'Home',
    },
    History: {
      title: 'Your farming history',
      description:
        'Saved recommendations and soil reports will appear here after database integration.',
      icon: History,
      button: 'Back to dashboard',
      target: 'Home',
    },
    Profile: {
      title: 'Your farm profile',
      description:
        'Farmer profiles, location and farm preferences will be added in a later phase.',
      icon: UserRound,
      button: 'Back to dashboard',
      target: 'Home',
    },
  }

  const page = details[activeNav] || details.Home
  const Icon = page.icon

  // Show the general recommendation form.
  if (activeNav === 'Recommendations') {
    return (
      <RecommendationWorkspace
        key="general"
        personalized={false}
        title={t('Find suitable crop options')}
        description={t(page.description)}
        onRecommend={onRecommend}
        result={recommendationResult}
        loading={recommendationLoading}
        error={recommendationError}
        onBack={() => setActiveNav('Home')}
      />
    )
  }

  // Keep soil-personalized recommendations separate.
  if (activeNav === 'Soil Analysis') {
    return (
      <RecommendationWorkspace
        key="personalized"
        personalized={true}
        title={t('Personalize recommendations with soil pH')}
        description={t(page.description)}
        onRecommend={onRecommend}
        result={recommendationResult}
        loading={recommendationLoading}
        error={recommendationError}
        onBack={() => setActiveNav('Home')}
      />
    )
  }

  if (activeNav === 'Profile') {
    return (
      <section className="mx-auto max-w-2xl py-10 sm:py-16">
        <div className="rounded-[28px] border border-[#E4E9DF] bg-white p-7 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF3E5] text-[#4F7D58]"><Icon size={30} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#4F7D58]">{t('KisanIQ workspace')}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">{t(page.title)}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#788078]">{t(page.description)}</p>
          <div className="mx-auto mt-7 max-w-sm text-left">
            <label htmlFor="profile-language" className="mb-2 block text-sm font-semibold">{t('Language')}</label>
            <select id="profile-language" value={selectedLanguage} onChange={(event) => onLanguageChange(event.target.value)} className="w-full rounded-xl border border-[#DCE4D7] bg-white px-4 py-3 text-sm">
              {supportedLanguages.map((language) => <option key={language.code} value={language.code}>{language.nativeLabel} ({language.label})</option>)}
            </select>
          </div>
          <button onClick={() => setActiveNav(page.target)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#173F35] px-5 py-3 font-semibold text-white transition hover:bg-[#285B4B]">{t(page.button)}<ArrowRight size={17} /></button>
        </div>
      </section>
    )
  }

  // Other pages remain placeholders for now.
  return (
    <section className="mx-auto max-w-2xl py-10 sm:py-16">
      <div className="rounded-[28px] border border-[#E4E9DF] bg-white p-7 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF3E5] text-[#4F7D58]">
          <Icon size={30} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#4F7D58]">
          {t('KisanIQ workspace')}
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {t(page.title)}
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#788078]">
          {t(page.description)}
        </p>

        <button
          onClick={() => setActiveNav(page.target)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#173F35] px-5 py-3 font-semibold text-white transition hover:bg-[#285B4B]"
        >
          {t(page.button)}
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  )
}

function RecommendationWorkspace({
  personalized,
  title,
  description,
  onRecommend,
  result,
  loading,
  error,
  onBack,
}) {
  const [soilType, setSoilType] = useState('black')
  const [season, setSeason] = useState('kharif')
  const [waterAvailability, setWaterAvailability] = useState('moderate')
  const [farmSizeAcres, setFarmSizeAcres] = useState('2')
  const [ph, setPh] = useState('6.8')

  async function handleSubmit(event) {
    event.preventDefault()

    const farmDetails = {
      soilType,
      season,
      waterAvailability,
      farmSizeAcres: Number(farmSizeAcres),
    }

    if (personalized) {
      farmDetails.ph = Number(ph)
    }

    await onRecommend(farmDetails, personalized)
  }

  const correctResult = result?.mode === (
    personalized ? 'soil-personalized' : 'general'
  )

  return (
    <section className="mx-auto max-w-4xl py-6 sm:py-10">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-5 text-sm font-semibold text-[#4F7D58]"
        >
          {t('← Back to dashboard')}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5EDCF] text-[#173F35]">
            {personalized ? (
              <FlaskConical size={25} />
            ) : (
              <Sprout size={25} />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#788078]">
              {description}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E4E9DF] bg-white p-5 shadow-sm sm:p-8"
      >
        <h3 className="text-lg font-bold">{t('Enter your farm details')}</h3>

        <p className="mt-1 text-sm text-[#788078]">
          {t('These inputs will be sent to your KisanIQ backend.')}
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="soilType"
              className="mb-2 block text-sm font-semibold"
            >
              {t('Soil type')}
            </label>

            <select
              id="soilType"
              value={soilType}
              onChange={(event) => setSoilType(event.target.value)}
              className="w-full rounded-xl border border-[#DCE4D7] bg-white px-4 py-3 text-sm"
            >
              <option value="black">{t('Black soil')}</option>
              <option value="loamy">{t('Loamy soil')}</option>
              <option value="alluvial">{t('Alluvial soil')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="season"
              className="mb-2 block text-sm font-semibold"
            >
              {t('Growing season')}
            </label>

            <select
              id="season"
              value={season}
              onChange={(event) => setSeason(event.target.value)}
              className="w-full rounded-xl border border-[#DCE4D7] bg-white px-4 py-3 text-sm"
            >
              <option value="kharif">{t('Kharif — monsoon season')}</option>
              <option value="rabi">{t('Rabi — winter season')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="waterAvailability"
              className="mb-2 block text-sm font-semibold"
            >
              {t('Water availability')}
            </label>

            <select
              id="waterAvailability"
              value={waterAvailability}
              onChange={(event) =>
                setWaterAvailability(event.target.value)
              }
              className="w-full rounded-xl border border-[#DCE4D7] bg-white px-4 py-3 text-sm"
            >
              <option value="low">{t('Low')}</option>
              <option value="moderate">{t('Moderate')}</option>
              <option value="high">{t('High')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="farmSizeAcres"
              className="mb-2 block text-sm font-semibold"
            >
              {t('Farm size (acres)')}
            </label>

            <input
              id="farmSizeAcres"
              type="number"
              min="0.01"
              max="100000"
              step="any"
              required
              onInvalid={(event) => event.currentTarget.setCustomValidity(t('Please enter a valid value.'))}
              onInput={(event) => event.currentTarget.setCustomValidity('')}
              value={farmSizeAcres}
              onChange={(event) => setFarmSizeAcres(event.target.value)}
              className="w-full rounded-xl border border-[#DCE4D7] px-4 py-3 text-sm"
            />
          </div>

          {personalized && (
            <div className="sm:col-span-2">
              <label
                htmlFor="soilPh"
                className="mb-2 block text-sm font-semibold"
              >
                {t('Soil pH (0–14)')}
              </label>

              <input
                id="soilPh"
                type="number"
                min="0"
                max="14"
                step="0.1"
                required
                onInvalid={(event) => event.currentTarget.setCustomValidity(t('Please enter a valid value.'))}
                onInput={(event) => event.currentTarget.setCustomValidity('')}
                value={ph}
                onChange={(event) => setPh(event.target.value)}
                className="w-full rounded-xl border border-[#DCE4D7] px-4 py-3 text-sm"
              />

              <p className="mt-2 text-xs leading-5 text-[#788078]">
                {t('Enter the value from your soil test report. The default is only an example; replace it with your actual result.')}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-[#F7F7F0] p-4 text-xs leading-5 text-[#788078]">
          <strong className="text-[#365A3F]">
            {t('Demonstration mode:')}
          </strong>{' '}
          {t('These initial recommendations use sample crop profiles and simple scoring rules. They do not yet incorporate live weather, verified market prices or a complete agricultural suitability model.')}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {t(error)}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173F35] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#285B4B] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading
            ? t('Getting recommendations...')
            : personalized
              ? t('Analyse soil and recommend crops')
              : t('Find recommended crops')}

          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      {correctResult && (
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F7D58]">
              {t('Backend response')}
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {t('Crop options')}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#788078]">
              {result.messageCode ? t(result.messageCode, { ...result.messageParams, season: t(`value.season.${result.messageParams.season}`) }) : result.message}
            </p>
          </div>

          <div className="space-y-4">
            {result.recommendations.map((crop) => (
              <article
                key={crop.cropId}
                className="rounded-2xl border border-[#E4E9DF] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#4F7D58]">
                      {t('RANK #{{rank}}', { rank: crop.rank })}
                    </p>

                    <h4 className="mt-1 text-lg font-bold">
                      {t(`crop.${crop.cropId}`, { defaultValue: crop.cropName })}
                    </h4>
                  </div>

                  <div className="rounded-xl bg-[#EDF3E5] px-3 py-2 text-center">
                    <p className="text-xl font-bold text-[#365A3F]">
                      {crop.score}
                    </p>
                    <p className="text-[10px] text-[#788078]">
                      {t('Demo score / 100')}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#788078]">
                  {crop.descriptionCode ? t(crop.descriptionCode, { ...crop.descriptionParams, season: t(`value.season.${crop.descriptionParams.season}`), sowingWindow: t(crop.descriptionParams.sowingWindow), cropName: t(`crop.${crop.cropId}`, { defaultValue: crop.cropName }) }) : crop.description}
                </p>

                <div className="mt-4 border-t border-[#EEF0E8] pt-4">
                  <h5 className="text-sm font-bold">
                    {t('Why this crop received this score')}
                  </h5>

                  <ul className="mt-2 space-y-2">
                    {(crop.reasonDetails || crop.reasons.map((text) => ({ text }))).map((reason, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm leading-5 text-[#667267]"
                      >
                        <span className="text-[#4F7D58]">•</span>
                        <span>{reason.code ? translatedReason(reason) : reason.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-[#788078]">
            {t('These scores are produced by demonstration rules. They are not probabilities of crop success and should not be used alone to make planting decisions.')}
          </p>
        </section>
      )}
    </section>
  )
}
export default App
