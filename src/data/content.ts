export type SectionKey =
  | 'landing'
  | 'whatIsAI'
  | 'aiDomains'
  | 'dataScience'
  | 'computerVision'
  | 'languageHarbor'
  | 'predictionLab'
  | 'classificationFactory'
  | 'regressionObservatory'
  | 'clusteringForest'
  | 'datasetVault'
  | 'dataTypeSort'
  | 'trainingArena'
  | 'workflowMachine'
  | 'finalMission';

export interface SectionData {
  key: SectionKey;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  realWorld: string;
}

export const sections: SectionData[] = [
  {
    key: 'landing',
    title: 'NeoCity AI Adventure',
    subtitle: 'Junior AI Explorer',
    description: 'Restore NeoCity by learning AI through missions in every district.',
    badge: 'Explorer',
    realWorld: 'Every AI system in NeoCity is built from the same ideas you will explore in these missions.',
  },
  {
    key: 'whatIsAI',
    title: 'What is AI?',
    subtitle: 'AI Sorting Lab',
    description: 'Sort devices into AI and non-AI to reveal the power of intelligence.',
    badge: 'AI Scout',
    realWorld: 'Real AI systems use sensors and data to decide, just like the devices you sort here.',
  },
  {
    key: 'aiDomains',
    title: 'AI Domains',
    subtitle: 'Control Room',
    description: 'Predict the powers behind each door before you enter the district.',
    badge: 'Domain Ranger',
    realWorld: 'Companies like Netflix use AI domain skills to recommend videos based on what you watch.',
  },
  {
    key: 'dataScience',
    title: 'Data Science District',
    subtitle: 'Pattern Workshop',
    description: 'Organize messy data and uncover hidden charts.',
    badge: 'Pattern Seeker',
    realWorld: 'Data scientists help businesses find hidden patterns in weather, finance, and games.',
  },
  {
    key: 'computerVision',
    title: 'Computer Vision City',
    subtitle: 'Vision Lab',
    description: 'Identify objects and discover how machines see.',
    badge: 'Visionary',
    realWorld: 'Self-driving cars use computer vision to recognize people, vehicles, and traffic lights.',
  },
  {
    key: 'languageHarbor',
    title: 'Language Harbor',
    subtitle: 'NLP Dock',
    description: 'Match speech and chat with bots to understand language AI.',
    badge: 'Word Whisperer',
    realWorld: 'Voice assistants like Siri and Alexa understand language using NLP techniques.',
  },
  {
    key: 'predictionLab',
    title: 'Prediction Lab',
    subtitle: 'Forecast Station',
    description: 'Use past data to predict the future and compare with AI.',
    badge: 'Predictor',
    realWorld: 'Weather apps make predictions the same way you use past data to guess tomorrow’s temperature.',
  },
  {
    key: 'classificationFactory',
    title: 'Classification Factory',
    subtitle: 'Sorting Plant',
    description: 'Group objects into categories to learn classification.',
    badge: 'Sorter',
    realWorld: 'Online shops classify items into categories so you can find the right product fast.',
  },
  {
    key: 'regressionObservatory',
    title: 'Regression Observatory',
    subtitle: 'Forecast Tower',
    description: 'Move the slider and see predictions change with the line.',
    badge: 'Navigator',
    realWorld: 'Regression helps delivery services predict arrival times from past order data.',
  },
  {
    key: 'clusteringForest',
    title: 'Clustering Forest',
    subtitle: 'Grouping Grove',
    description: 'Group similar items and compare with AI clustering.',
    badge: 'Cluster Master',
    realWorld: 'Clustering groups similar customers together for better recommendations on music apps.',
  },
  {
    key: 'datasetVault',
    title: 'Dataset Vault',
    subtitle: 'Data Treasure Room',
    description: 'Unlock dataset cards using the right data type match.',
    badge: 'Vault Keeper',
    realWorld: 'Databases, photos, and chat logs are all stored as different dataset types in the real world.',
  },
  {
    key: 'dataTypeSort',
    title: 'Structured vs Unstructured',
    subtitle: 'Data Sort Challenge',
    description: 'Sort examples into structured or unstructured to earn rewards.',
    badge: 'Data Architect',
    realWorld: 'Structured data like spreadsheets is easier for AI to learn from than raw photos or audio.',
  },
  {
    key: 'trainingArena',
    title: 'Training Arena',
    subtitle: 'Practice Match',
    description: 'Choose training, validation, and test data for the robot athlete.',
    badge: 'Coach',
    realWorld: 'Training, validation and testing are like practice, review and final exam for machine learning.',
  },
  {
    key: 'workflowMachine',
    title: 'Workflow Machine',
    subtitle: 'AI Factory',
    description: 'Connect the steps to power the model-building machine.',
    badge: 'Engineer',
    realWorld: 'Following the AI workflow is exactly how real teams build smart apps and robots.',
  },
  {
    key: 'finalMission',
    title: 'Final Mission',
    subtitle: 'Restore the AI Core',
    description: 'Use classification, prediction, and dataset skills to save NeoCity.',
    badge: 'Guardian',
    realWorld: 'The final mission uses classification, prediction, and data type skills together, just like real AI systems do.',
  },
];

export const aiDomainPrompts = [
  {
    domain: 'Data Science',
    options: ['Discover hidden patterns', 'Translate speech', 'Track weather trends', 'Detect objects'],
    answer: ['Discover hidden patterns', 'Track weather trends'],
  },
  {
    domain: 'Computer Vision',
    options: ['Read handwriting', 'Identify animals', 'Spot objects in images', 'Analyze sound'],
    answer: ['Identify animals', 'Spot objects in images'],
  },
  {
    domain: 'Natural Language Processing',
    options: ['Match speech to text', 'Forecast future values', 'Translate words', 'Sort unlabeled groups'],
    answer: ['Match speech to text', 'Translate words'],
  },
];

export const aiExamples = [
  { label: 'Calculator', icon: '🔢', group: 'Not AI' },
  { label: 'Smart Speaker', icon: '🎙️', group: 'AI' },
  { label: 'Traffic Light', icon: '🚦', group: 'Not AI' },
  { label: 'Chatbot', icon: '💬', group: 'AI' },
  { label: 'Microwave', icon: '🔥', group: 'Not AI' },
];

export const dataScienceCards = [
  { id: 'a', icon: '🌧️', label: 'Rainfall: 12 mm', type: 'weather' },
  { id: 'b', icon: '📝', label: 'Math score: 89', type: 'marks' },
  { id: 'c', icon: '🏆', label: 'Goals scored: 4', type: 'sports' },
  { id: 'd', icon: '🌡️', label: 'Temperature: 30°C', type: 'weather' },
  { id: 'e', icon: '📘', label: 'English score: 76', type: 'marks' },
];

export const visionCards = [
  { label: 'Panda', image: '🐼' },
  { label: 'Car', image: '🚗' },
  { label: 'Bird', image: '🐦' },
];

export const languagePairs = [
  { phrase: 'Hello', match: 'Hi', hint: 'Greeting' },
  { phrase: 'Thank you', match: 'Thanks', hint: 'Polite reply' },
  { phrase: 'Goodbye', match: 'Bye', hint: 'Farewell' },
];

export const predictionHistory = [
  { day: 'Mon', temp: 24 },
  { day: 'Tue', temp: 27 },
  { day: 'Wed', temp: 26 },
  { day: 'Thu', temp: 29 },
  { day: 'Fri', temp: 28 },
];

export const classificationCards = [
  { id: '1', icon: '🍎', label: 'Apple', category: 'Fruit' },
  { id: '2', icon: '🦁', label: 'Lion', category: 'Animal' },
  { id: '3', icon: '🚌', label: 'Bus', category: 'Vehicle' },
  { id: '4', icon: '🍌', label: 'Banana', category: 'Fruit' },
  { id: '5', icon: '🐘', label: 'Elephant', category: 'Animal' },
];

export const clusteringItems = [
  { id: 'c1', icon: '⭕', label: 'Circle', type: 'shape' },
  { id: 'c2', icon: '◼️', label: 'Square', type: 'shape' },
  { id: 'c3', icon: '🦁', label: 'Lion', type: 'animal' },
  { id: 'c4', icon: '🐯', label: 'Tiger', type: 'animal' },
  { id: 'c5', icon: '🎸', label: 'Guitar', type: 'object' },
  { id: 'c6', icon: '🎹', label: 'Piano', type: 'object' },
];

export const datasetTypes = [
  { id: 'n', icon: '🔢', label: 'Numerical', example: 'Sales total' },
  { id: 't', icon: '💬', label: 'Text', example: 'Chat message' },
  { id: 'm', icon: '🖼️', label: 'Multimedia', example: 'Instagram photo' },
  { id: 's', icon: '⏱️', label: 'Time-Series', example: 'Temperature log' },
  { id: 'p', icon: '🗺️', label: 'Spatial', example: 'Map coordinates' },
];

export const structureExamples = [
  { icon: '🧾', label: 'Excel sheet', type: 'Structured' },
  { icon: '📸', label: 'Instagram photo', type: 'Unstructured' },
  { icon: '🎙️', label: 'Voice recording', type: 'Unstructured' },
  { icon: '🗃️', label: 'Database table', type: 'Structured' },
  { icon: '🎬', label: 'Video', type: 'Unstructured' },
];

export const trainingCards = [
  { id: 'train', icon: '🏋️', label: 'Practice examples', stage: 'Training' },
  { id: 'validate', icon: '🔍', label: 'Validation set', stage: 'Validation' },
  { id: 'test', icon: '📝', label: 'Final exam set', stage: 'Testing' },
];

export const workflowSteps = [
  'Collect Data',
  'Prepare Data',
  'Train Model',
  'Improve Model',
];

export const finalMissionTasks = [
  { id: 'm1', label: 'Classify sensor alerts', type: 'classification' },
  { id: 'm2', label: 'Predict energy demand', type: 'prediction' },
  { id: 'm3', label: 'Select dataset type', type: 'dataset' },
  { id: 'm4', label: 'Spot the broken pattern', type: 'pattern' },
];
