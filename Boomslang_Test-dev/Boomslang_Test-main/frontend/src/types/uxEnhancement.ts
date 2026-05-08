export interface UXEnhancement {
  id: string;
  name: string;
  description: string;
  category: UXCategory;
  type: UXType;
  status: UXStatus;
  priority: Priority;
  version: string;
  configuration: UXConfiguration;
  settings: UXSettings;
  metrics: UXMetrics;
  feedback: UXFeedback;
  abTest?: ABTest;
  personalization: Personalization;
  accessibility: Accessibility;
  performance: UXPerformance;
  metadata: UXMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  publishedAt?: Date;
  publishedBy?: string;
  tags: string[];
}

export type UXCategory = 
  | 'NAVIGATION'
  | 'LAYOUT'
  | 'INTERACTION'
  | 'VISUAL'
  | 'CONTENT'
  | 'FORMS'
  | 'FEEDBACK'
  | 'ONBOARDING'
  | 'ACCESSIBILITY'
  | 'RESPONSIVE'
  | 'ANIMATION'
  | 'MICROINTERACTIONS'
  | 'PERSONALIZATION'
  | 'PERFORMANCE'
  | 'MOBILE';

export type UXType = 
  | 'COMPONENT'
  | 'PAGE'
  | 'FLOW'
  | 'PATTERN'
  | 'TEMPLATE'
  | 'THEME'
  | 'WIDGET'
  | 'MODAL'
  | 'TOOLTIP'
  | 'BANNER'
  | 'NOTIFICATION'
  | 'CAROUSEL'
  | 'TABS'
  | 'ACCORDION'
  | 'DROPDOWN'
  | 'SEARCH'
  | 'FILTER';

export type UXStatus = 
  | 'DRAFT'
  | 'DESIGN'
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'STAGING'
  | 'PRODUCTION'
  | 'PAUSED'
  | 'DEPRECATED'
  | 'DISABLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UXConfiguration {
  design: DesignConfig;
  behavior: BehaviorConfig;
  content: ContentConfig;
  styling: StylingConfig;
  interactions: InteractionConfig;
  responsive: ResponsiveConfig;
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
}

export interface DesignConfig {
  layout: LayoutConfig;
  colors: ColorConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borders: BorderConfig;
  shadows: ShadowConfig;
  icons: IconConfig;
  images: ImageConfig;
}

export interface LayoutConfig {
  type: LayoutType;
  columns: number;
  gaps: SpacingValue;
  padding: SpacingValue;
  margin: SpacingValue;
  maxWidth?: string;
  alignment: Alignment;
  breakpoints: BreakpointConfig[];
}

export type LayoutType = 
  | 'GRID'
  | 'FLEX'
  | 'BLOCK'
  | 'INLINE'
  | 'FLOAT'
  | 'ABSOLUTE'
  | 'RELATIVE'
  | 'FIXED'
  | 'STICKY';

export interface SpacingValue {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export type Alignment = 
  | 'LEFT'
  | 'CENTER'
  | 'RIGHT'
  | 'JUSTIFY'
  | 'STRETCH';

export interface BreakpointConfig {
  name: string;
  minWidth: number;
  maxWidth?: number;
  columns?: number;
  layout?: LayoutType;
}

export interface ColorConfig {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
  custom: Record<string, string>;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  focus: string;
}

export interface TypographyConfig {
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  fontWeight: FontWeightScale;
  lineHeight: LineHeightScale;
  letterSpacing: LetterSpacingScale;
  heading: HeadingConfig;
  body: BodyConfig;
}

export interface FontFamily {
  primary: string;
  secondary: string;
  monospace: string;
  display: string;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface FontWeightScale {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeightScale {
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacingScale {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface HeadingConfig {
  h1: TypographyVariant;
  h2: TypographyVariant;
  h3: TypographyVariant;
  h4: TypographyVariant;
  h5: TypographyVariant;
  h6: TypographyVariant;
}

export interface TypographyVariant {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textTransform?: TextTransform;
}

export type TextTransform = 'NONE' | 'UPPERCASE' | 'LOWERCASE' | 'CAPITALIZE';

export interface BodyConfig {
  large: TypographyVariant;
  base: TypographyVariant;
  small: TypographyVariant;
  xs: TypographyVariant;
}

export interface SpacingConfig {
  scale: SpacingScale;
  container: ContainerSpacing;
  component: ComponentSpacing;
}

export interface SpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface ContainerSpacing {
  section: string;
  container: string;
  card: string;
  button: string;
  input: string;
}

export interface ComponentSpacing {
  gap: string;
  separator: string;
  padding: string;
  margin: string;
}

export interface BorderConfig {
  radius: BorderRadiusScale;
  width: BorderWidthScale;
  style: BorderStyle;
  colors: BorderColors;
}

export interface BorderRadiusScale {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface BorderWidthScale {
  0: string;
  1: string;
  2: string;
  4: string;
  8: string;
}

export type BorderStyle = 'SOLID' | 'DASHED' | 'DOTTED' | 'DOUBLE' | 'GROOVE' | 'RIDGE' | 'INSET' | 'OUTSET';

export interface BorderColors {
  default: string;
  light: string;
  dark: string;
  focus: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ShadowConfig {
  scale: ShadowScale;
  colors: ShadowColors;
}

export interface ShadowScale {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface ShadowColors {
  default: string;
  colored: string;
  light: string;
  dark: string;
}

export interface IconConfig {
  library: IconLibrary;
  size: IconSizeScale;
  colors: IconColors;
}

export interface IconLibrary {
  primary: string;
  secondary: string;
  custom: string[];
}

export interface IconSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface IconColors {
  default: string;
  muted: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ImageConfig {
  placeholder: PlaceholderConfig;
  optimization: OptimizationConfig;
  lazyLoading: LazyLoadingConfig;
  formats: ImageFormat[];
}

export interface PlaceholderConfig {
  enabled: boolean;
  type: PlaceholderType;
  color: string;
  blur: number;
}

export type PlaceholderType = 'BLUR' | 'COLOR' | 'GRAYSCALE' | 'PATTERN';

export interface OptimizationConfig {
  enabled: boolean;
  quality: number;
  format: ImageFormat;
  compression: boolean;
}

export type ImageFormat = 'WEBP' | 'AVIF' | 'JPEG' | 'PNG' | 'GIF' | 'SVG';

export interface LazyLoadingConfig {
  enabled: boolean;
  threshold: number;
  rootMargin: string;
}

export interface BehaviorConfig {
  animations: AnimationConfig;
  transitions: TransitionConfig;
  interactions: InteractionBehaviorConfig;
  gestures: GestureConfig;
  scrolling: ScrollConfig;
  loading: LoadingConfig;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: AnimationDuration;
  easing: EasingFunction[];
  presets: AnimationPreset[];
  performance: AnimationPerformance;
}

export interface AnimationDuration {
  fast: string;
  normal: string;
  slow: string;
  slower: string;
}

export type EasingFunction = 
  | 'LINEAR'
  | 'EASE'
  | 'EASE_IN'
  | 'EASE_OUT'
  | 'EASE_IN_OUT'
  | 'EASE_IN_QUAD'
  | 'EASE_OUT_QUAD'
  | 'EASE_IN_OUT_QUAD'
  | 'EASE_IN_CUBIC'
  | 'EASE_OUT_CUBIC'
  | 'EASE_IN_OUT_CUBIC'
  | 'SPRING'
  | 'BOUNCE';

export interface AnimationPreset {
  name: string;
  duration: string;
  easing: EasingFunction;
  properties: string[];
}

export interface AnimationPerformance {
  reducedMotion: boolean;
  hardwareAcceleration: boolean;
  frameRate: number;
  optimization: boolean;
}

export interface TransitionConfig {
  duration: TransitionDuration;
  easing: EasingFunction;
  properties: TransitionProperties;
}

export interface TransitionDuration {
  fast: string;
  normal: string;
  slow: string;
}

export interface TransitionProperties {
  colors: string;
  opacity: string;
  transform: string;
  layout: string;
}

export interface InteractionBehaviorConfig {
  hover: HoverConfig;
  focus: FocusConfig;
  active: ActiveConfig;
  disabled: DisabledConfig;
}

export interface HoverConfig {
  enabled: boolean;
  scale: number;
  brightness: number;
  transition: string;
}

export interface FocusConfig {
  enabled: boolean;
  outline: OutlineConfig;
  ring: FocusRingConfig;
}

export interface OutlineConfig {
  width: string;
  color: string;
  style: BorderStyle;
  offset: string;
}

export interface FocusRingConfig {
  width: string;
  color: string;
  offset: string;
}

export interface ActiveConfig {
  enabled: boolean;
  scale: number;
  brightness: number;
  transition: string;
}

export interface DisabledConfig {
  opacity: number;
  cursor: string;
  pointerEvents: string;
}

export interface GestureConfig {
  swipe: SwipeConfig;
  pinch: PinchConfig;
  rotate: RotateConfig;
  pan: PanConfig;
}

export interface SwipeConfig {
  enabled: boolean;
  threshold: number;
  velocity: number;
  direction: SwipeDirection[];
}

export type SwipeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface PinchConfig {
  enabled: boolean;
  scale: number;
  threshold: number;
}

export interface RotateConfig {
  enabled: boolean;
  angle: number;
  threshold: number;
}

export interface PanConfig {
  enabled: boolean;
  threshold: number;
  direction: SwipeDirection[];
}

export interface ScrollConfig {
  behavior: ScrollBehavior;
  smooth: SmoothScrollConfig;
  snap: ScrollSnapConfig;
  indicators: ScrollIndicatorsConfig;
}

export type ScrollBehavior = 'AUTO' | 'SMOOTH' | 'INSTANT';

export interface SmoothScrollConfig {
  enabled: boolean;
  duration: string;
  easing: EasingFunction;
  offset: number;
}

export interface ScrollSnapConfig {
  enabled: boolean;
  type: ScrollSnapType;
  alignment: ScrollSnapAlignment;
}

export type ScrollSnapType = 'NONE' | 'MANDATORY' | 'PROXIMITY';
export type ScrollSnapAlignment = 'START' | 'CENTER' | 'END' | 'NEAREST';

export interface ScrollIndicatorsConfig {
  enabled: boolean;
  type: IndicatorType;
  position: IndicatorPosition;
  style: IndicatorStyle;
}

export type IndicatorType = 'DOTS' | 'BARS' | 'ARROWS' | 'PROGRESS';
export type IndicatorPosition = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
export type IndicatorStyle = 'SOLID' | 'OUTLINE' | 'GRADIENT';

export interface LoadingConfig {
  skeleton: SkeletonConfig;
  spinner: SpinnerConfig;
  progress: ProgressConfig;
}

export interface SkeletonConfig {
  enabled: boolean;
  animation: string;
  color: string;
  shimmer: boolean;
}

export interface SpinnerConfig {
  type: SpinnerType;
  size: string;
  color: string;
  speed: string;
}

export type SpinnerType = 'CIRCLE' | 'DOTS' | 'BARS' | 'PULSE' | 'WAVE';

export interface ProgressConfig {
  type: ProgressType;
  color: string;
  backgroundColor: string;
  height: string;
  animation: boolean;
}

export type ProgressType = 'LINEAR' | 'CIRCULAR' | 'RADIAL';

export interface ContentConfig {
  text: TextContentConfig;
  images: ImageContentConfig;
  videos: VideoContentConfig;
  audio: AudioContentConfig;
  tables: TableContentConfig;
  lists: ListContentConfig;
}

export interface TextContentConfig {
  readability: ReadabilityConfig;
  hierarchy: TextHierarchyConfig;
  emphasis: TextEmphasisConfig;
  links: LinkConfig;
}

export interface ReadabilityConfig {
  maxLineLength: number;
  lineHeight: number;
  fontSize: string;
  contrast: ContrastConfig;
}

export interface ContrastConfig {
  minimum: number;
  enhanced: boolean;
  highContrast: boolean;
}

export interface TextHierarchyConfig {
  enabled: boolean;
  structure: HeadingStructure;
  spacing: HeadingSpacing;
}

export interface HeadingStructure {
  h1: boolean;
  h2: boolean;
  h3: boolean;
  h4: boolean;
  h5: boolean;
  h6: boolean;
}

export interface HeadingSpacing {
  before: string;
  after: string;
}

export interface TextEmphasisConfig {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  highlight: HighlightConfig;
}

export interface HighlightConfig {
  enabled: boolean;
  color: string;
  backgroundColor: string;
}

export interface LinkConfig {
  style: LinkStyle;
  color: string;
  decoration: TextDecoration;
  hover: LinkHoverConfig;
}

export type LinkStyle = 'UNDERLINE' | 'NONE' | 'BORDER_BOTTOM';
export type TextDecoration = 'NONE' | 'UNDERLINE' | 'OVERLINE' | 'LINE_THROUGH';

export interface LinkHoverConfig {
  color: string;
  decoration: TextDecoration;
  transform: string;
}

export interface ImageContentConfig {
  sizing: ImageSizingConfig;
  captions: CaptionConfig;
  altText: AltTextConfig;
}

export interface ImageSizingConfig {
  responsive: boolean;
  maxWidth: string;
  height: string;
  objectFit: ObjectFit;
}

export type ObjectFit = 'COVER' | 'CONTAIN' | 'FILL' | 'NONE' | 'SCALE_DOWN';

export interface CaptionConfig {
  enabled: boolean;
  position: CaptionPosition;
  style: CaptionStyle;
}

export type CaptionPosition = 'TOP' | 'BOTTOM' | 'OVERLAY';
export type CaptionStyle = 'PLAIN' | 'CARD' | 'OVERLAY';

export interface AltTextConfig {
  required: boolean;
  autoGenerate: boolean;
  fallback: string;
}

export interface VideoContentConfig {
  player: VideoPlayerConfig;
  controls: VideoControlsConfig;
  accessibility: VideoAccessibilityConfig;
}

export interface VideoPlayerConfig {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  playsInline: boolean;
}

export interface VideoControlsConfig {
  enabled: boolean;
  position: ControlsPosition;
  style: ControlsStyle;
}

export type ControlsPosition = 'TOP' | 'BOTTOM' | 'OVERLAY';
export type ControlsStyle = 'DEFAULT' | 'MINIMAL' | 'CUSTOM';

export interface VideoAccessibilityConfig {
  captions: boolean;
  descriptions: boolean;
  keyboard: boolean;
}

export interface AudioContentConfig {
  player: AudioPlayerConfig;
  controls: AudioControlsConfig;
  visualization: AudioVisualizationConfig;
}

export interface AudioPlayerConfig {
  autoplay: boolean;
  loop: boolean;
  preload: PreloadType;
}

export type PreloadType = 'NONE' | 'METADATA' | 'AUTO';

export interface AudioControlsConfig {
  enabled: boolean;
  style: ControlsStyle;
}

export interface AudioVisualizationConfig {
  enabled: boolean;
  type: VisualizationType;
  colors: string[];
}

export type VisualizationType = 'BARS' | 'WAVE' | 'CIRCULAR' | 'PARTICLES';

export interface TableContentConfig {
  responsive: TableResponsiveConfig;
  styling: TableStylingConfig;
  sorting: TableSortingConfig;
  filtering: TableFilteringConfig;
}

export interface TableResponsiveConfig {
  enabled: boolean;
  strategy: ResponsiveStrategy;
  breakpoint: string;
}

export type ResponsiveStrategy = 'STACK' | 'SCROLL' | 'HIDE' | 'COLLAPSE';

export interface TableStylingConfig {
  stripes: boolean;
  borders: TableBorders;
  hover: boolean;
  compact: boolean;
}

export interface TableBorders {
  horizontal: boolean;
  vertical: boolean;
  outer: boolean;
}

export interface TableSortingConfig {
  enabled: boolean;
  multiSort: boolean;
  icons: boolean;
}

export interface TableFilteringConfig {
  enabled: boolean;
  inline: boolean;
  persistent: boolean;
}

export interface ListContentConfig {
  styling: ListStylingConfig;
  spacing: ListSpacingConfig;
  markers: ListMarkersConfig;
}

export interface ListStylingConfig {
  bullets: boolean;
  numbers: boolean;
  custom: boolean;
}

export interface ListSpacingConfig {
  between: string;
  indent: string;
}

export interface ListMarkersConfig {
  style: MarkerStyle;
  color: string;
  size: string;
}

export type MarkerStyle = 'DISC' | 'CIRCLE' | 'SQUARE' | 'DECIMAL' | 'CUSTOM';

export interface StylingConfig {
  themes: ThemeConfig[];
  darkMode: DarkModeConfig;
  customProperties: CustomPropertiesConfig;
  utilities: UtilityConfig;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ColorConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  shadows: ShadowConfig;
  borders: BorderConfig;
  isDefault: boolean;
  isDark: boolean;
}

export interface DarkModeConfig {
  enabled: boolean;
  toggle: DarkModeToggle;
  auto: DarkModeAuto;
  themes: DarkModeTheme[];
}

export interface DarkModeToggle {
  enabled: boolean;
  position: TogglePosition;
  style: ToggleStyle;
}

export type TogglePosition = 'HEADER' | 'SIDEBAR' | 'FLOATING' | 'SETTINGS';
export type ToggleStyle = 'SWITCH' | 'BUTTON' | 'ICON' | 'CUSTOM';

export interface DarkModeAuto {
  enabled: boolean;
  schedule: ScheduleConfig;
  system: boolean;
}

export interface ScheduleConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface DarkModeTheme {
  light: string;
  dark: string;
  transition: boolean;
}

export interface CustomPropertiesConfig {
  enabled: boolean;
  prefix: string;
  properties: CustomProperty[];
}

export interface CustomProperty {
  name: string;
  value: string;
  description: string;
  category: string;
}

export interface UtilityConfig {
  enabled: boolean;
  framework: UtilityFramework;
  custom: CustomUtility[];
}

export type UtilityFramework = 'TAILWIND' | 'BOOTSTRAP' | 'MATERIAL_UI' | 'CUSTOM';

export interface CustomUtility {
  name: string;
  properties: string[];
  responsive: boolean;
  variants: string[];
}

export interface InteractionConfig {
  clicks: ClickConfig;
  hovers: HoverInteractionConfig;
  focus: FocusInteractionConfig;
  keyboard: KeyboardConfig;
  touch: TouchConfig;
  gestures: GestureInteractionConfig;
}

export interface ClickConfig {
  debounce: number;
  doubleClick: boolean;
  longPress: LongPressConfig;
  ripple: RippleConfig;
}

export interface LongPressConfig {
  enabled: boolean;
  duration: number;
  feedback: FeedbackType;
}

export type FeedbackType = 'VIBRATION' | 'VISUAL' | 'AUDIO' | 'NONE';

export interface RippleConfig {
  enabled: boolean;
  color: string;
  duration: string;
  size: string;
}

export interface HoverInteractionConfig {
  delay: number;
  tooltip: TooltipConfig;
  preview: PreviewConfig;
}

export interface TooltipConfig {
  enabled: boolean;
  position: TooltipPosition;
  delay: number;
  duration: number;
  style: TooltipStyle;
}

export type TooltipPosition = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'AUTO';
export type TooltipStyle = 'DEFAULT' | 'DARK' | 'LIGHT' | 'COLORFUL';

export interface PreviewConfig {
  enabled: boolean;
  trigger: PreviewTrigger;
  size: string;
  delay: number;
}

export type PreviewTrigger = 'HOVER' | 'CLICK' | 'FOCUS';

export interface FocusInteractionConfig {
  trap: boolean;
  restore: boolean;
  visible: boolean;
  skipLinks: SkipLinkConfig;
}

export interface SkipLinkConfig {
  enabled: boolean;
  position: SkipLinkPosition;
  text: string;
}

export type SkipLinkPosition = 'TOP' | 'TOP_LEFT' | 'TOP_RIGHT';

export interface KeyboardConfig {
  shortcuts: KeyboardShortcut[];
  navigation: KeyboardNavigationConfig;
  help: KeyboardHelpConfig;
}

export interface KeyboardShortcut {
  keys: string[];
  action: string;
  description: string;
  global: boolean;
}

export interface KeyboardNavigationConfig {
  enabled: boolean;
  wrap: boolean;
  autoFirst: boolean;
  visualIndicator: boolean;
}

export interface KeyboardHelpConfig {
  enabled: boolean;
  trigger: string;
  style: HelpStyle;
}

export type HelpStyle = 'MODAL' | 'TOOLTIP' | 'SIDEBAR' | 'FLOATING';

export interface TouchConfig {
  feedback: TouchFeedbackConfig;
  gestures: TouchGestureConfig;
  zones: TouchZoneConfig[];
}

export interface TouchFeedbackConfig {
  enabled: boolean;
  type: FeedbackType;
  intensity: number;
}

export interface TouchGestureConfig {
  swipe: SwipeGestureConfig;
  pinch: PinchGestureConfig;
  rotate: RotateGestureConfig;
  tap: TapGestureConfig;
}

export interface SwipeGestureConfig {
  enabled: boolean;
  threshold: number;
  velocity: number;
  actions: SwipeAction[];
}

export interface SwipeAction {
  direction: SwipeDirection;
  action: string;
  element: string;
}

export interface PinchGestureConfig {
  enabled: boolean;
  threshold: number;
  action: string;
}

export interface RotateGestureConfig {
  enabled: boolean;
  threshold: number;
  action: string;
}

export interface TapGestureConfig {
  singleTap: boolean;
  doubleTap: boolean;
  longPress: boolean;
}

export interface TouchZoneConfig {
  element: string;
  action: string;
  gesture: string;
}

export interface GestureInteractionConfig {
  global: boolean;
  conflicts: GestureConflictConfig;
  learning: GestureLearningConfig;
}

export interface GestureConflictConfig {
  enabled: boolean;
  strategy: ConflictStrategy;
  timeout: number;
}

export type ConflictStrategy = 'FIRST' | 'LAST' | 'PRIORITY' | 'DISABLE';

export interface GestureLearningConfig {
  enabled: boolean;
  adaptation: boolean;
  feedback: boolean;
}

export interface ResponsiveConfig {
  breakpoints: ResponsiveBreakpoint[];
  containers: ContainerConfig[];
  grid: GridConfig;
  images: ResponsiveImageConfig;
  typography: ResponsiveTypographyConfig;
}

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  columns: number;
  gutter: string;
  margin: string;
}

export interface ContainerConfig {
  name: string;
  maxWidth: string;
  padding: string;
  center: boolean;
}

export interface GridConfig {
  enabled: boolean;
  columns: number;
  gap: string;
  autoFit: boolean;
  minColumnWidth: string;
}

export interface ResponsiveImageConfig {
  enabled: boolean;
  sizes: ResponsiveImageSize[];
  formats: ImageFormat[];
  quality: ResponsiveQualityConfig;
}

export interface ResponsiveImageSize {
  breakpoint: string;
  width: number;
  height?: number;
  crop: boolean;
}

export interface ResponsiveQualityConfig {
  enabled: boolean;
  desktop: number;
  tablet: number;
  mobile: number;
}

export interface ResponsiveTypographyConfig {
  enabled: boolean;
  scale: ResponsiveTypographyScale;
  fluid: boolean;
}

export interface ResponsiveTypographyScale {
  mobile: FontSizeScale;
  tablet: FontSizeScale;
  desktop: FontSizeScale;
}

export interface AccessibilityConfig {
  screenReader: ScreenReaderConfig;
  keyboard: AccessibilityKeyboardConfig;
  color: ColorAccessibilityConfig;
  motion: MotionAccessibilityConfig;
  cognitive: CognitiveAccessibilityConfig;
}

export interface ScreenReaderConfig {
  enabled: boolean;
  labels: ScreenReaderLabels;
  announcements: AnnouncementConfig;
  navigation: ScreenReaderNavigationConfig;
}

export interface ScreenReaderLabels {
  required: boolean;
  descriptive: boolean;
  contextual: boolean;
}

export interface AnnouncementConfig {
  enabled: boolean;
  politeness: PolitenessLevel;
  live: boolean;
}

export type PolitenessLevel = 'POLITE' | 'ASSERTIVE' | 'OFF';

export interface ScreenReaderNavigationConfig {
  landmarks: boolean;
  headings: boolean;
  links: boolean;
  forms: boolean;
}

export interface AccessibilityKeyboardConfig {
  navigation: KeyboardNavigationAccessibilityConfig;
  shortcuts: AccessibilityShortcutConfig;
  focus: FocusAccessibilityConfig;
}

export interface KeyboardNavigationAccessibilityConfig {
  visible: boolean;
  skipLinks: boolean;
  trapFocus: boolean;
}

export interface AccessibilityShortcutConfig {
  enabled: boolean;
  help: boolean;
  custom: KeyboardShortcut[];
}

export interface FocusAccessibilityConfig {
  visible: boolean;
  highContrast: boolean;
  large: boolean;
}

export interface ColorAccessibilityConfig {
  contrast: ContrastAccessibilityConfig;
  blindness: ColorBlindnessConfig;
  highContrast: HighContrastConfig;
}

export interface ContrastAccessibilityConfig {
  minimum: number;
  enhanced: boolean;
  checker: boolean;
}

export interface ColorBlindnessConfig {
  simulation: boolean;
  types: ColorBlindnessType[];
  adjustments: ColorBlindnessAdjustment[];
}

export type ColorBlindnessType = 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA' | 'ACHROMATOPSIA';

export interface ColorBlindnessAdjustment {
  type: ColorBlindnessType;
  adjustments: ColorAdjustment[];
}

export interface ColorAdjustment {
  property: string;
  value: string;
}

export interface HighContrastConfig {
  enabled: boolean;
  toggle: boolean;
  auto: boolean;
  theme: string;
}

export interface MotionAccessibilityConfig {
  reduced: ReducedMotionConfig;
  preferences: MotionPreferencesConfig;
}

export interface ReducedMotionConfig {
  enabled: boolean;
  respect: boolean;
  fallback: FallbackConfig;
}

export interface FallbackConfig {
  animations: boolean;
  transitions: boolean;
  gestures: boolean;
}

export interface MotionPreferencesConfig {
  detection: boolean;
  adaptation: boolean;
  learning: boolean;
}

export interface CognitiveAccessibilityConfig {
  simplicity: SimplicityConfig;
  consistency: ConsistencyConfig;
  predictability: PredictabilityConfig;
  assistance: AssistanceConfig;
}

export interface SimplicityConfig {
  enabled: boolean;
  level: SimplicityLevel;
  adaptive: boolean;
}

export type SimplicityLevel = 'MINIMAL' | 'SIMPLE' | 'DETAILED' | 'ADVANCED';

export interface ConsistencyConfig {
  patterns: boolean;
  terminology: boolean;
  layout: boolean;
}

export interface PredictabilityConfig {
  navigation: boolean;
  feedback: boolean;
  loading: boolean;
}

export interface AssistanceConfig {
  hints: boolean;
  tutorials: boolean;
  guidance: boolean;
}

export interface PerformanceConfig {
  optimization: OptimizationConfig;
  monitoring: MonitoringConfig;
  budgets: PerformanceBudget[];
}

export interface OptimizationConfig {
  lazyLoading: boolean;
  codeSplitting: boolean;
  treeShaking: boolean;
  minification: boolean;
  compression: boolean;
  caching: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  reporting: boolean;
}

export interface PerformanceMetric {
  name: string;
  threshold: number;
  unit: string;
  critical: boolean;
}

export interface PerformanceAlert {
  metric: string;
  condition: AlertCondition;
  recipients: string[];
  enabled: boolean;
}

export interface PerformanceBudget {
  type: BudgetType;
  value: number;
  unit: string;
  enforced: boolean;
}

export type BudgetType = 'WEIGHT' | 'SIZE' | 'TIME' | 'REQUESTS';

export interface UXSettings {
  enabled: boolean;
  autoUpdate: boolean;
  testing: TestingSettings;
  monitoring: MonitoringSettings;
  rollout: RolloutSettings;
}

export interface TestingSettings {
  enabled: boolean;
  types: TestType[];
  environments: TestEnvironment[];
  participants: TestParticipant[];
}

export type TestType = 'USABILITY' | 'A11Y' | 'PERFORMANCE' | 'COMPATIBILITY' | 'VISUAL';

export interface TestEnvironment {
  name: string;
  url: string;
  devices: Device[];
  browsers: Browser[];
}

export interface Device {
  name: string;
  type: DeviceType;
  screenSize: ScreenSize;
  userAgent: string;
}

export type DeviceType = 'DESKTOP' | 'LAPTOP' | 'TABLET' | 'MOBILE' | 'WEARABLE';

export interface ScreenSize {
  width: number;
  height: number;
  density: number;
}

export interface Browser {
  name: string;
  version: string;
  engine: string;
}

export interface TestParticipant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  experience: ExperienceLevel;
}

export type ParticipantRole = 'USER' | 'DESIGNER' | 'DEVELOPER' | 'MANAGER' | 'STAKEHOLDER';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface MonitoringSettings {
  enabled: boolean;
  metrics: UXMetric[];
  events: UXEvent[];
  realTime: boolean;
  retention: RetentionPolicy;
}

export interface UXMetric {
  name: string;
  type: MetricType;
  threshold: number;
  unit: string;
  description: string;
}

export type MetricType = 'PERFORMANCE' | 'ENGAGEMENT' | 'SATISFACTION' | 'ERROR' | 'CONVERSION';

export interface UXEvent {
  name: string;
  category: EventCategory;
  tracked: boolean;
  properties: EventProperty[];
}

export type EventCategory = 'CLICK' | 'SCROLL' | 'FORM' | 'NAVIGATION' | 'ERROR' | 'CUSTOM';

export interface EventProperty {
  name: string;
  type: PropertyType;
  required: boolean;
}

export interface RetentionPolicy {
  enabled: boolean;
  days: number;
  aggregation: boolean;
  anonymization: boolean;
}

export interface RolloutSettings {
  strategy: RolloutStrategy;
  percentage: number;
  criteria: RolloutCriteria[];
  monitoring: boolean;
  rollback: boolean;
}

export type RolloutStrategy = 'IMMEDIATE' | 'GRADUAL' | 'CANARY' | 'FEATURE_FLAG' | 'A_B_TEST';

export interface RolloutCriteria {
  type: CriteriaType;
  value: string;
  weight: number;
}

export type CriteriaType = 'USER_SEGMENT' | 'GEOGRAPHY' | 'DEVICE' | 'BROWSER' | 'LANGUAGE' | 'CUSTOM';

export interface UXMetrics {
  usage: UsageMetrics;
  performance: PerformanceMetrics;
  engagement: EngagementMetrics;
  satisfaction: SatisfactionMetrics;
  accessibility: AccessibilityMetrics;
  errors: ErrorMetrics;
}

export interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  uniquePageViews: number;
  bounceRate: number;
  sessionDuration: number;
  retentionRate: number;
  churnRate: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  coreWebVitals: CoreWebVitals;
}

export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
}

export interface EngagementMetrics {
  clickThroughRate: number;
  conversionRate: number;
  taskCompletionRate: number;
  timeOnTask: number;
  errorRate: number;
  interactionRate: number;
  scrollDepth: number;
  featureAdoption: FeatureAdoption[];
}

export interface FeatureAdoption {
  feature: string;
  users: number;
  percentage: number;
  firstUse: Date;
  frequency: number;
}

export interface SatisfactionMetrics {
  overall: number;
  usability: number;
  aesthetics: number;
  content: number;
  nps: NetPromoterScore;
  ratings: UserRating[];
  feedback: UserFeedback[];
}

export interface NetPromoterScore {
  promoters: number;
  detractors: number;
  passives: number;
  score: number;
  total: number;
}

export interface UserRating {
  userId: string;
  rating: number;
  category: RatingCategory;
  comment?: string;
  timestamp: Date;
}

export type RatingCategory = 'OVERALL' | 'USABILITY' | 'DESIGN' | 'PERFORMANCE' | 'CONTENT';

export interface UserFeedback {
  id: string;
  userId: string;
  type: FeedbackType;
  content: string;
  sentiment: SentimentScore;
  category: FeedbackCategory;
  timestamp: Date;
  resolved: boolean;
}

export type FeedbackType = 'BUG' | 'SUGGESTION' | 'COMPLAINT' | 'COMPLIMENT' | 'QUESTION';
export type FeedbackCategory = 'USABILITY' | 'DESIGN' | 'CONTENT' | 'PERFORMANCE' | 'FEATURE' | 'OTHER';

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  overall: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface AccessibilityMetrics {
  compliance: ComplianceLevel;
  violations: AccessibilityViolation[];
  tests: AccessibilityTest[];
  score: number;
}

export type ComplianceLevel = 'AAA' | 'AA' | 'A' | 'NONE';

export interface AccessibilityViolation {
  type: ViolationType;
  severity: ViolationSeverity;
  element: string;
  description: string;
  impact: string;
  count: number;
}

export type ViolationType = 'COLOR_CONTRAST' | 'MISSING_ALT' | 'MISSING_LABEL' | 'NO_KEYBOARD' | 'NO_FOCUS' | 'INVALID_HTML';
export type ViolationSeverity = 'CRITICAL' | 'SERIOUS' | 'MODERATE' | 'MINOR';

export interface AccessibilityTest {
  type: AccessibilityTestType;
  passed: boolean;
  score: number;
  issues: string[];
  timestamp: Date;
}

export type AccessibilityTestType = 'SCREEN_READER' | 'KEYBOARD' | 'COLOR_CONTRAST' | 'FOCUS_VISIBLE' | 'SEMANTIC_HTML';

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  errorsByType: ErrorType[];
  errorsByPage: ErrorByPage[];
  criticalErrors: CriticalError[];
}

export interface ErrorType {
  type: string;
  count: number;
  percentage: number;
}

export interface ErrorByPage {
  page: string;
  errors: number;
  users: number;
  impact: number;
}

export interface CriticalError {
  id: string;
  type: string;
  message: string;
  stack: string;
  userAgent: string;
  userId?: string;
  timestamp: Date;
  resolved: boolean;
}

export interface UXFeedback {
  id: string;
  enhancementId: string;
  userId: string;
  type: FeedbackType;
  content: string;
  rating?: number;
  sentiment: SentimentScore;
  category: FeedbackCategory;
  context: FeedbackContext;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface FeedbackContext {
  page: string;
  component: string;
  action: string;
  device: string;
  browser: string;
  userAgent: string;
  sessionId: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ABVariant[];
  traffic: TrafficConfig;
  duration: DurationConfig;
  successMetrics: SuccessMetric[];
  status: ABTestStatus;
  results: ABTestResults;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  traffic: number;
  changes: VariantChange[];
}

export interface VariantChange {
  type: ChangeType;
  element: string;
  property: string;
  value: string;
}

export type ChangeType = 'STYLE' | 'CONTENT' | 'LAYOUT' | 'INTERACTION' | 'BEHAVIOR';

export interface TrafficConfig {
  total: number;
  allocation: TrafficAllocation[];
  targeting: TargetingConfig;
}

export interface TrafficAllocation {
  variantId: string;
  percentage: number;
  criteria: RolloutCriteria[];
}

export interface TargetingConfig {
  enabled: boolean;
  criteria: RolloutCriteria[];
  exclude: RolloutCriteria[];
}

export interface DurationConfig {
  startDate: Date;
  endDate: Date;
  autoStop: boolean;
  minimumSampleSize: number;
  confidenceLevel: number;
}

export interface SuccessMetric {
  name: string;
  type: MetricType;
  target: number;
  baseline: number;
  improvement: number;
}

export type ABTestStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface ABTestResults {
  status: ResultStatus;
  winner?: string;
  confidence: number;
  significance: number;
  metrics: MetricResult[];
  variants: VariantResult[];
  summary: TestSummary;
}

export type ResultStatus = 'INCONCLUSIVE' | 'SIGNIFICANT' | 'NO_DIFFERENCE' | 'INSUFFICIENT_DATA';

export interface MetricResult {
  metric: string;
  baseline: number;
  variants: VariantMetric[];
  improvement: number;
  significance: boolean;
}

export interface VariantMetric {
  variantId: string;
  value: number;
  change: number;
  confidence: number;
}

export interface VariantResult {
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  metrics: MetricResult[];
}

export interface TestSummary {
  totalParticipants: number;
  totalConversions: number;
  overallConversionRate: number;
  testDuration: number;
  statisticalPower: number;
}

export interface Personalization {
  enabled: boolean;
  strategy: PersonalizationStrategy;
  segments: UserSegment[];
  rules: PersonalizationRule[];
  content: PersonalizedContent[];
  recommendations: RecommendationConfig;
}

export type PersonalizationStrategy = 'RULE_BASED' | 'ML_BASED' | 'HYBRID' | 'COLLABORATIVE';

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  size: number;
  dynamic: boolean;
}

export interface SegmentCriteria {
  type: CriteriaType;
  operator: CriteriaOperator;
  value: string;
  weight: number;
}

export type CriteriaOperator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';

export interface PersonalizationRule {
  id: string;
  name: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

export interface RuleCondition {
  field: string;
  operator: CriteriaOperator;
  value: string;
  logicalOperator: LogicalOperator;
}

export type LogicalOperator = 'AND' | 'OR' | 'NOT';

export interface RuleAction {
  type: ActionType;
  target: string;
  value: string;
  delay: number;
}

export interface PersonalizedContent {
  id: string;
  type: ContentType;
  target: string;
  variations: ContentVariation[];
  fallback: string;
}

export type ContentType = 'TEXT' | 'IMAGE' | 'LAYOUT' | 'COMPONENT' | 'STYLE' | 'BEHAVIOR';

export interface ContentVariation {
  segmentId: string;
  content: string;
  weight: number;
}

export interface RecommendationConfig {
  enabled: boolean;
  algorithm: RecommendationAlgorithm;
  sources: RecommendationSource[];
  display: RecommendationDisplay;
}

export type RecommendationAlgorithm = 'COLLABORATIVE' | 'CONTENT_BASED' | 'HYBRID' | 'POPULARITY' | 'TRENDING';

export interface RecommendationSource {
  type: SourceType;
  weight: number;
  config: SourceConfig;
}

export type SourceType = 'USER_BEHAVIOR' | 'CONTENT_SIMILARITY' | 'POPULARITY' | 'TRENDS' | 'EXTERNAL';

export interface SourceConfig {
  [key: string]: any;
}

export interface RecommendationDisplay {
  position: DisplayPosition;
  count: number;
  template: string;
  styling: DisplayStyling;
}

export type DisplayPosition = 'SIDEBAR' | 'HEADER' | 'FOOTER' | 'INLINE' | 'MODAL' | 'TOOLTIP';

export interface DisplayStyling {
  theme: string;
  layout: string;
  animation: boolean;
}

export interface Accessibility {
  compliance: AccessibilityCompliance;
  testing: AccessibilityTesting;
  features: AccessibilityFeatures;
  monitoring: AccessibilityMonitoring;
}

export interface AccessibilityCompliance {
  standard: ComplianceStandard;
  level: ComplianceLevel;
  score: number;
  violations: AccessibilityViolation[];
  lastAudit: Date;
  nextAudit: Date;
}

export type ComplianceStandard = 'WCAG' | 'SECTION508' | 'EN301549' | 'ADA';

export interface AccessibilityTesting {
  automated: AutomatedTesting;
  manual: ManualTesting;
  user: UserTesting;
}

export interface AutomatedTesting {
  enabled: boolean;
  tools: TestingTool[];
  frequency: TestingFrequency;
  coverage: number;
}

export interface TestingTool {
  name: string;
  type: ToolType;
  config: ToolConfig;
  enabled: boolean;
}

export type ToolType = 'AXE' | 'LIGHTEHOUSE' | 'WAVE' | 'SORTSITE' | 'CUSTOM';

export interface ToolConfig {
  [key: string]: any;
}

export type TestingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';

export interface ManualTesting {
  enabled: boolean;
  testers: AccessibilityTester[];
  schedule: TestingSchedule;
  checklist: TestingChecklist[];
}

export interface AccessibilityTester {
  id: string;
  name: string;
  email: string;
  role: TesterRole;
  expertise: ExpertiseLevel;
}

export type TesterRole = 'AUDITOR' | 'USER' | 'DESIGNER' | 'DEVELOPER';
export type ExpertiseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface TestingSchedule {
  enabled: boolean;
  frequency: TestingFrequency;
  nextTest: Date;
}

export interface TestingChecklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  category: ChecklistCategory;
}

export interface ChecklistItem {
  id: string;
  description: string;
  required: boolean;
  tested: boolean;
  result: TestResult;
  notes?: string;
}

export type TestResult = 'PASS' | 'FAIL' | 'NA' | 'SKIP';
export type ChecklistCategory = 'KEYBOARD' | 'SCREEN_READER' | 'COLOR' | 'FOCUS' | 'SEMANTICS' | 'FORMS';

export interface UserTesting {
  enabled: boolean;
  participants: AccessibilityUser[];
  tasks: AccessibilityTask[];
  feedback: AccessibilityUserFeedback[];
}

export interface AccessibilityUser {
  id: string;
  name: string;
  email: string;
  disability: DisabilityType[];
  tools: AssistiveTechnology[];
  experience: ExperienceLevel;
}

export type DisabilityType = 'VISUAL' | 'HEARING' | 'MOTOR' | 'COGNITIVE' | 'MULTIPLE';
export type AssistiveTechnology = 'SCREEN_READER' | 'VOICE_CONTROL' | 'SWITCH' | 'MAGNIFIER' | 'KEYBOARD' | 'TOUCH';

export interface AccessibilityTask {
  id: string;
  name: string;
  description: string;
  steps: TaskStep[];
  successCriteria: SuccessCriteria[];
}

export interface TaskStep {
  id: string;
  description: string;
  expected: string;
  required: boolean;
}

export interface SuccessCriteria {
  id: string;
  description: string;
  measurable: boolean;
  threshold?: number;
}

export interface AccessibilityUserFeedback {
  id: string;
  userId: string;
  taskId: string;
  rating: number;
  comment: string;
  issues: AccessibilityIssue[];
  suggestions: string[];
  timestamp: Date;
}

export interface AccessibilityIssue {
  type: ViolationType;
  severity: ViolationSeverity;
  description: string;
  element: string;
  reproducible: boolean;
}

export interface AccessibilityFeatures {
  screenReader: ScreenReaderFeatures;
  keyboard: KeyboardFeatures;
  color: ColorFeatures;
  motion: MotionFeatures;
  cognitive: CognitiveFeatures;
}

export interface ScreenReaderFeatures {
  labels: boolean;
  descriptions: boolean;
  landmarks: boolean;
  headings: boolean;
  lists: boolean;
  tables: boolean;
  forms: boolean;
  links: boolean;
  buttons: boolean;
  images: boolean;
}

export interface KeyboardFeatures {
  navigation: boolean;
  shortcuts: boolean;
  skipLinks: boolean;
  focusManagement: boolean;
  trapFocus: boolean;
  visibleFocus: boolean;
  order: boolean;
}

export interface ColorFeatures {
  contrast: boolean;
  highContrast: boolean;
  colorBlindness: boolean;
  customizable: boolean;
  indicators: boolean;
}

export interface MotionFeatures {
  reducedMotion: boolean;
  animations: boolean;
  autoPlay: boolean;
  pauses: boolean;
  controls: boolean;
}

export interface CognitiveFeatures {
  simplicity: boolean;
  consistency: boolean;
  predictability: boolean;
  assistance: boolean;
  timeLimits: boolean;
  distractions: boolean;
}

export interface AccessibilityMonitoring {
  enabled: boolean;
  metrics: AccessibilityMetric[];
  alerts: AccessibilityAlert[];
  reports: AccessibilityReport[];
}

export interface AccessibilityMetric {
  name: string;
  type: AccessibilityMetricType;
  threshold: number;
  current: number;
  trend: TrendDirection;
}

export type AccessibilityMetricType = 'COMPLIANCE' | 'VIOLATIONS' | 'USABILITY' | 'SATISFACTION';

export interface AccessibilityAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  threshold: number;
  recipients: string[];
  enabled: boolean;
}

export interface AccessibilityReport {
  id: string;
  name: string;
  type: ReportType;
  schedule: ReportSchedule;
  recipients: string[];
  lastGenerated: Date;
  nextGeneration: Date;
}

export type ReportType = 'COMPLIANCE' | 'MONITORING' | 'AUDIT' | 'SUMMARY';

export interface ReportSchedule {
  enabled: boolean;
  frequency: TestingFrequency;
  timezone: string;
}

export interface UXPerformance {
  metrics: UXPerformanceMetrics;
  optimization: UXOptimization;
  monitoring: UXPerformanceMonitoring;
  budgets: UXPerformanceBudget[];
}

export interface UXPerformanceMetrics {
  load: LoadMetrics;
  render: RenderMetrics;
  interaction: InteractionMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
}

export interface LoadMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstByte: number;
  sslTime: number;
  connectionTime: number;
  dnsTime: number;
}

export interface RenderMetrics {
  firstPaint: number;
  firstContentfulPaint: number;
  firstMeaningfulPaint: number;
  largestContentfulPaint: number;
  speedIndex: number;
  cumulativeLayoutShift: number;
}

export interface InteractionMetrics {
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  interactionToNextPaint: number;
}

export interface MemoryMetrics {
  used: number;
  available: number;
  percentage: number;
  leaks: MemoryLeak[];
}

export interface MemoryLeak {
  component: string;
  size: number;
  detected: Date;
  resolved?: Date;
}

export interface NetworkMetrics {
  requests: number;
  size: number;
  cached: number;
  compression: number;
  domains: number;
}

export interface UXOptimization {
  lazyLoading: LazyLoadingOptimization;
  codeSplitting: CodeSplittingOptimization;
  images: ImageOptimization;
  fonts: FontOptimization;
  scripts: ScriptOptimization;
  styles: StyleOptimization;
}

export interface LazyLoadingOptimization {
  enabled: boolean;
  images: boolean;
  videos: boolean;
  components: boolean;
  routes: boolean;
}

export interface CodeSplittingOptimization {
  enabled: boolean;
  routes: boolean;
  components: boolean;
  vendors: boolean;
  dynamic: boolean;
}

export interface ImageOptimization {
  enabled: boolean;
  formats: ImageFormat[];
  quality: number;
  compression: boolean;
  responsive: boolean;
  lazy: boolean;
}

export interface FontOptimization {
  enabled: boolean;
  loading: FontLoadingStrategy;
  display: FontDisplayStrategy;
  preload: string[];
}

export type FontLoadingStrategy = 'BLOCK' | 'SWAP' | 'FALLBACK' | 'OPTIONAL';
export type FontDisplayStrategy = 'AUTO' | 'BLOCK' | 'SWAP' | 'FALLBACK' | 'OPTIONAL';

export interface ScriptOptimization {
  enabled: boolean;
  minification: boolean;
  compression: boolean;
  bundling: boolean;
  treeshaking: boolean;
  async: boolean;
  defer: boolean;
}

export interface StyleOptimization {
  enabled: boolean;
  minification: boolean;
  compression: boolean;
  purging: boolean;
  critical: boolean;
  inline: boolean;
}

export interface UXPerformanceMonitoring {
  enabled: boolean;
  realTime: boolean;
  alerts: UXPerformanceAlert[];
  dashboards: UXPerformanceDashboard[];
  reports: UXPerformanceReport[];
}

export interface UXPerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  condition: AlertCondition;
  recipients: string[];
  enabled: boolean;
}

export interface UXPerformanceDashboard {
  id: string;
  name: string;
  metrics: string[];
  filters: DashboardFilter[];
  refresh: number;
}

export interface DashboardFilter {
  name: string;
  type: FilterType;
  options: FilterOption[];
}

export type FilterType = 'SELECT' | 'DATE_RANGE' | 'TEXT' | 'NUMBER';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UXPerformanceReport {
  id: string;
  name: string;
  type: ReportType;
  schedule: ReportSchedule;
  metrics: string[];
  recipients: string[];
}

export interface UXPerformanceBudget {
  id: string;
  name: string;
  type: BudgetType;
  value: number;
  unit: string;
  enforced: boolean;
  current: number;
  status: BudgetStatus;
}

export type BudgetStatus = 'WITHIN' | 'WARNING' | 'EXCEEDED';

export interface UXMetadata {
  version: string;
  environment: string;
  category: string;
  tags: string[];
  documentation?: string;
  changelog: ChangelogEntry[];
  dependencies: UXDependency[];
  requirements: UXRequirement[];
  compatibility: CompatibilityInfo;
  support: SupportInfo;
  licensing: LicensingInfo;
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  author: string;
  changes: string[];
  type: 'MAJOR' | 'MINOR' | 'PATCH';
  breaking: boolean;
}

export interface UXDependency {
  id: string;
  name: string;
  version: string;
  type: DependencyType;
  required: boolean;
  description?: string;
}

export type DependencyType = 'COMPONENT' | 'LIBRARY' | 'API' | 'SERVICE' | 'THEME' | 'PLUGIN';

export interface UXRequirement {
  type: RequirementType;
  value: string;
  description: string;
  critical: boolean;
}

export interface CompatibilityInfo {
  browsers: BrowserCompatibility[];
  devices: DeviceCompatibility[];
  platforms: PlatformCompatibility[];
}

export interface BrowserCompatibility {
  name: string;
  version: string;
  supported: boolean;
  issues: CompatibilityIssue[];
}

export interface DeviceCompatibility {
  type: DeviceType;
  supported: boolean;
  issues: CompatibilityIssue[];
}

export interface PlatformCompatibility {
  name: string;
  version: string;
  supported: boolean;
  issues: CompatibilityIssue[];
}

export interface CompatibilityIssue {
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  workaround?: string;
}

export interface SupportInfo {
  level: SupportLevel;
  team: string;
  contact: SupportContact[];
  documentation: string;
  training: TrainingResource[];
}

export interface LicensingInfo {
  type: LicenseType;
  provider: string;
  key?: string;
  expiry?: Date;
  limits: LicenseLimit[];
  features: LicenseFeature[];
  compliance: LicenseCompliance;
}
