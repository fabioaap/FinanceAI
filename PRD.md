# FinanceAI - Personal Finance Dashboard

A streamlined personal finance control application that helps users track monthly expenses, manage bills, and achieve savings goals with AI-powered insights.

**Experience Qualities**:
1. **Clarity** - Financial information should be immediately understandable with visual hierarchies that guide attention to what matters most
2. **Confidence** - Every interaction should feel secure and deliberate, reinforcing trust in financial data accuracy
3. **Efficiency** - Common tasks like expense entry should be frictionless, requiring minimal steps and cognitive load

**Complexity Level**: Light Application (multiple features with basic state)
This is a feature-rich financial dashboard with persistent data, multiple views, and AI integration, but maintains simplicity through focused functionality and intuitive workflows.

## Essential Features

### Monthly Dashboard View
- **Functionality**: Displays current month financial overview with income, expenses, balance, and category breakdown
- **Purpose**: Provides at-a-glance understanding of financial health and spending patterns
- **Trigger**: Default landing view on app load
- **Progression**: App loads → Dashboard renders with current month data → User scans cards for key metrics → Views category chart → Identifies spending patterns
- **Success criteria**: All financial metrics load within 300ms, charts render smoothly, data updates reflect immediately after any transaction

### Quick Expense Entry
- **Functionality**: Fast modal form for recording income or expenses with AI category suggestion
- **Purpose**: Removes friction from the most frequent action, encouraging consistent tracking
- **Trigger**: Floating action button or keyboard shortcut
- **Progression**: User clicks FAB → Modal opens → User enters amount and description → AI suggests category → User confirms → Transaction saved → Dashboard updates → Success toast appears
- **Success criteria**: Modal opens instantly, AI suggestion appears within 1 second, form validates properly, success feedback is clear

### Category-Based Visualization
- **Functionality**: Interactive chart showing expense distribution across categories with drill-down capability
- **Purpose**: Reveals spending patterns and identifies areas for potential savings
- **Trigger**: Always visible on dashboard, clickable for details
- **Progression**: User views chart → Identifies high-spend category → Clicks category → Sees detailed transaction list → Reviews individual expenses
- **Success criteria**: Chart renders accurately, interactions feel responsive, category details load instantly

### Bills & Reminders Management
- **Functionality**: Track upcoming bills with status indicators (pending/paid/overdue) and recurrence options
- **Purpose**: Prevents missed payments and provides forward-looking financial awareness
- **Trigger**: Reminders widget on dashboard or dedicated modal view
- **Progression**: User clicks "Add Bill" → Enters description, amount, due date, recurrence → Saves → Bill appears in upcoming list → User marks as paid when completed
- **Success criteria**: Bills sort chronologically, overdue items are visually distinct, marking as paid is one-click

### Savings Goals Tracker
- **Functionality**: Set financial goals with target amounts and track progress with visual indicators
- **Purpose**: Motivates intentional saving behavior and celebrates progress toward objectives
- **Trigger**: Goals widget on dashboard or dedicated modal
- **Progression**: User creates goal → Sets target amount and deadline → Makes progress through income allocation → Views progress bar → Reaches milestone → Celebrates completion
- **Success criteria**: Progress calculates accurately, visual feedback is encouraging, completed goals are celebrated

### AI Financial Insights
- **Functionality**: Automated analysis of spending patterns with natural language observations and suggestions
- **Purpose**: Provides personalized financial intelligence without requiring user analysis effort
- **Trigger**: Automatically generates when sufficient data exists, displays in dashboard widget
- **Progression**: System analyzes transactions → Identifies patterns (spending increases, savings opportunities) → Generates insight card → User reads suggestion → Optionally acts on recommendation
- **Success criteria**: Insights are relevant and actionable, language is clear and non-judgmental, suggestions are practical

### Transaction History View
- **Functionality**: Comprehensive view of all transactions with search, filtering, sorting, and deletion capabilities
- **Purpose**: Enables users to review, analyze, and manage their complete transaction history across all time periods
- **Trigger**: History button in header toggles between dashboard and history view
- **Progression**: User clicks "History" button → Full transaction list loads → User applies filters/search → Views filtered results → Can delete individual transactions → Returns to dashboard
- **Success criteria**: All transactions load instantly, filters work in real-time, search is responsive, sorting updates smoothly, delete action has confirmation and updates immediately

## Edge Case Handling

- **Empty States**: Beautiful illustrations and clear CTAs guide users to add their first transaction, bill, or goal
- **No Data Periods**: Gracefully handle months with zero transactions showing helpful prompts rather than broken charts
- **Large Transaction Volumes**: Virtualize lists and paginate when displaying hundreds of transactions
- **Deleted Categories**: Reassign transactions to "Uncategorized" and prompt user to recategorize
- **Future Dates**: Allow but visually distinguish transactions dated in the future
- **Negative Balances**: Display without alarm but with subtle indicators suggesting attention needed

## Design Direction

The design should evoke confidence, clarity, and calm sophistication - like a personal financial advisor who is professional yet approachable. Aim for a clean, modern interface with generous spacing and purposeful color use that feels premium without being intimidating. The interface should lean toward minimal richness, where each element serves a clear purpose and data visualizations take center stage.

## Color Selection

**Triadic color scheme** - Using three balanced colors to distinguish income (green), expenses (red), and neutral actions (blue), creating clear semantic meaning while maintaining visual harmony.

- **Primary Color**: Deep Blue `oklch(0.45 0.15 250)` - Communicates trust, stability, and financial professionalism. Used for primary actions and navigation.
- **Secondary Colors**: 
  - Emerald Green `oklch(0.60 0.15 160)` for income and positive growth
  - Coral Red `oklch(0.60 0.15 25)` for expenses and alerts (softer than destructive red)
- **Accent Color**: Amber `oklch(0.75 0.15 85)` for highlights, AI insights, and goal progress
- **Foreground/Background Pairings**:
  - Background (Light Cream `oklch(0.98 0.01 85)`): Dark Slate text `oklch(0.25 0.02 250)` - Ratio 12.1:1 ✓
  - Card (Pure White `oklch(1 0 0)`): Dark Slate text `oklch(0.25 0.02 250)` - Ratio 13.4:1 ✓
  - Primary (Deep Blue `oklch(0.45 0.15 250)`): White text `oklch(1 0 0)` - Ratio 7.2:1 ✓
  - Secondary (Emerald `oklch(0.60 0.15 160)`): White text `oklch(1 0 0)` - Ratio 4.9:1 ✓
  - Accent (Amber `oklch(0.75 0.15 85)`): Dark Slate text `oklch(0.25 0.02 250)` - Ratio 5.8:1 ✓
  - Muted (Light Gray `oklch(0.95 0 0)`): Medium Gray text `oklch(0.55 0 0)` - Ratio 5.1:1 ✓

## Font Selection

Typography should balance modern professionalism with friendly approachability, using clean geometric sans-serifs that excel at displaying numbers and financial data.

**Google Fonts**: Inter for interface text (exceptional legibility, designed for screens) and JetBrains Mono for financial figures (clear number distinction, tabular spacing).

- **Typographic Hierarchy**:
  - H1 (Month Title): Inter Bold / 32px / -0.02em tight letter spacing / leading-tight
  - H2 (Section Headers): Inter SemiBold / 20px / -0.01em / leading-snug
  - H3 (Card Titles): Inter Medium / 16px / normal / leading-normal
  - Body (Descriptions): Inter Regular / 14px / normal / leading-relaxed
  - Financial Figures: JetBrains Mono Medium / 28px / tabular-nums / leading-none
  - Small Figures: JetBrains Mono Regular / 16px / tabular-nums / leading-tight
  - Labels: Inter Medium / 12px / 0.02em wide / uppercase / leading-none

## Animations

Animations should feel purposeful and confident, never frivolous - like a financial advisor who moves with deliberate precision. Motion reinforces the sense that data is real and actions have weight, while maintaining efficiency for power users.

- **Purposeful Meaning**: Transitions between months should feel like turning pages of a ledger. Transaction additions should smoothly insert into lists, giving weight to financial commitments. Success states should celebrate without distracting.
- **Hierarchy of Movement**: Dashboard cards fade in sequentially on load (50ms stagger) establishing reading order. The monthly balance number animates with spring physics when changing, drawing eye to the most important metric. Modal overlays use subtle backdrop blur with gentle scale entrance.

## Component Selection

- **Components**: 
  - `Card` with subtle shadows for dashboard widgets
  - `Dialog` for quick expense entry and detailed views
  - `Button` with distinct primary/secondary/ghost variants
  - `Input` and `Label` for forms with inline validation
  - `Select` for category and month pickers
  - `Tabs` for switching between transaction types and filters
  - `Progress` bars for goal tracking
  - `Badge` for bill status indicators and category labels
  - `Calendar` for date selection in bill reminders
  - `Separator` for visual section breaks
  - Custom `Chart` components using D3 for category visualization
  - `Tabs` for transaction history type filtering (All/Income/Expense)
  
- **Customizations**: 
  - Custom financial input component with currency formatting
  - Category icon picker component
  - Month navigation component with year-at-a-glance
  - AI insight card with animated sparkle indicator
  - Transaction list with swipe actions for quick edit/delete
  
- **States**: 
  - Buttons use subtle shadow lift on hover, deeper press on active
  - Inputs show accent border on focus with smooth color transition
  - Cards lift slightly on hover when clickable
  - Loading states use skeleton screens matching content layout
  - Empty states feature friendly illustrations with clear CTAs
  
- **Icon Selection**: 
  - `TrendingUp/TrendingDown` for balance changes
  - `Plus` for add actions
  - `ArrowLeft/ArrowRight` for month navigation
  - `ArrowUp/ArrowDown` for income/expense indicators
  - `ChartPie` for categories
  - `Bell` for reminders
  - `Target` for goals
  - `Sparkle` for AI insights
  - `Gear` for settings
  - `ClockCounterClockwise` for transaction history
  - `House` for dashboard/home
  - `MagnifyingGlass` for search
  - `Trash` for delete actions
  - Category icons: `ShoppingCart`, `Home`, `Car`, `Coffee`, `HeartPulse`, `Briefcase`, `GraduationCap`, `Gamepad`, `Receipt`
  
- **Spacing**: 
  - Dashboard uses `gap-6` between major sections
  - Cards have `p-6` internal padding
  - Form fields use `gap-4` vertical spacing
  - List items have `py-3 px-4` for comfortable touch targets
  - Modal content uses `p-6` with `gap-6` for sections
  
- **Mobile**: 
  - Dashboard shifts from 3-column grid to single column below 768px
  - Financial figures remain prominent but reduce from 28px to 24px
  - Month navigation becomes full-width sticky header
  - Floating action button increases to 56px diameter on mobile
  - Modal sheets slide from bottom on mobile instead of center dialog
  - Chart legends collapse to scrollable horizontal on narrow screens
  - Transaction history filters stack vertically on mobile
  - Search bar remains full-width across all breakpoints
