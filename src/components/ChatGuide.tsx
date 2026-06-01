import { useState } from 'react';
import { SectionKey } from '../data/content';

const guideCopy: Record<SectionKey, { greeting: string; advice: string; hint: string }> = {
  landing: {
    greeting: 'NeoCity’s central AI has weathered a system shock. I am Captain Nova, your guide through the recovery mission.',
    advice: 'Start with the AI Sorting Lab and follow each district’s challenge. I will help with strategy but not the exact answers.',
    hint: 'Think about whether a device can learn or adapt. If it makes decisions on its own, it is more likely AI.',
  },
  whatIsAI: {
    greeting: 'Welcome to the Sorting Lab. This is where we tell real AI apart from ordinary tools.',
    advice: 'Place each device in the correct zone. Remember: AI is about learning, sensing, and adapting.',
    hint: 'A calculator follows fixed rules. A chatbot responds and learns patterns — that is closer to AI.',
  },
  aiDomains: {
    greeting: 'The Control Room has many doors. Each door belongs to a different AI specialty.',
    advice: 'Choose the powers that match each domain. Don’t pick options that belong to another door.',
    hint: 'Computer Vision focuses on images and objects. NLP works with language and words.',
  },
  dataScience: {
    greeting: 'Here in the Pattern Workshop, we use data to reveal hidden stories.',
    advice: 'Group the cards by the type of data they represent. Similar examples belong together.',
    hint: 'Weather data often uses temperatures or rainfall. Marks are test scores, not images.',
  },
  computerVision: {
    greeting: 'In the Vision Lab, the AI is seeing the city through pictures.',
    advice: 'Tap the images that are animals. This helps the AI focus on what matters.',
    hint: 'Birds and pandas are living things. Traffic signals and cars are objects, not animals.',
  },
  languageHarbor: {
    greeting: 'The NLP Dock translates and matches meaning inside language AI.',
    advice: 'Match each phrase with the best response option. Think about the meaning before choosing.',
    hint: '“Hello” and “Hi” are greetings. “Thank you” and “Thanks” are both polite replies.',
  },
  predictionLab: {
    greeting: 'At the Forecast Station, AI uses past history to predict the next value.',
    advice: 'Compare the temperature trend and choose the value that fits the pattern.',
    hint: 'If the temperature has been rising steadily, the next value should continue the trend.',
  },
  classificationFactory: {
    greeting: 'The Sorting Plant helps AI classify objects into neat groups.',
    advice: 'Select one card and place it in the category that describes it best.',
    hint: 'Fruits are edible and sweet. Vehicles move people and animals transport themselves.',
  },
  regressionObservatory: {
    greeting: 'In the Forecast Tower, the model draws a line to estimate future values.',
    advice: 'Move the slider and observe how the predicted mark changes. Lock in the value that fits the trend.',
    hint: 'More study hours usually mean more marks. Watch how the number increases as the slider moves.',
  },
  clusteringForest: {
    greeting: 'The Grouping Grove asks you to collect similar items together.',
    advice: 'Group items based on what makes them similar, not just how they look.',
    hint: 'Shapes belong together. Animals belong together. Objects with similar use belong together.',
  },
  datasetVault: {
    greeting: 'The Vault stores examples of how different datasets are used.',
    advice: 'Match the example to the dataset type that describes it best.',
    hint: 'Text data is words and sentences. Multimedia is photos or videos.',
  },
  dataTypeSort: {
    greeting: 'In the Data Sort Challenge, AI learns the difference between neat and messy data.',
    advice: 'Choose whether each example is structured or unstructured based on its format.',
    hint: 'Tables and spreadsheets are structured. Voice recordings and photos are unstructured.',
  },
  trainingArena: {
    greeting: 'The Practice Match trains the model before its final exam.',
    advice: 'Assign the right set to training, validation, and testing.',
    hint: 'Training is for practice, validation checks the model, testing is the final exam.',
  },
  workflowMachine: {
    greeting: 'The AI Factory runs a process from start to finish.',
    advice: 'Put the steps in the order that AI models are built.',
    hint: 'You must collect data before you can train a model. Improving comes after training.',
  },
  finalMission: {
    greeting: 'This is the final core challenge. Your decisions will restore NeoCity’s AI.',
    advice: 'Answer each mini-challenge carefully, then prepare for the guardian battle.',
    hint: 'Use what you learned in earlier missions: classification, prediction, data type, and patterns.',
  },
};

export function ChatGuide({ section, feedback }: { section: SectionKey; feedback?: string }) {
  const [showHint, setShowHint] = useState(false);
  const guide = guideCopy[section];

  return (
    <div className="chat-guide">
      <div className="chat-head">
        <div className="chat-avatar" aria-hidden="true">🤖</div>
        <div>
          <p className="chat-title">Captain Nova</p>
          <p className="chat-line">{guide.greeting}</p>
        </div>
      </div>
      <p className="chat-advice">{feedback ?? guide.advice}</p>
      <div className="chat-actions">
        <button type="button" className="small-button chat-help-button" onClick={() => setShowHint((prev) => !prev)}>
          {showHint ? 'Hide hint' : 'Need a hint?'}
        </button>
      </div>
      {showHint ? <div className="chat-hint">{guide.hint}</div> : null}
    </div>
  );
}
