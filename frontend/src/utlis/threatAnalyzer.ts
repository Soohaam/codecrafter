// Simplified threat analysis based on text content
// In a real app, this would be more sophisticated and possibly use AI models

// List of potentially concerning keywords
const concerningKeywords = {
    low: [
      'annoyed', 'upset', 'angry', 'frustrated', 'unhappy',
      'displeased', 'irritated', 'bothered', 'argument'
    ],
    medium: [
      'threat', 'fight', 'hostile', 'aggression', 'aggressive', 
      'confront', 'confrontation', 'warning', 'revenge', 'retaliation',
      'challenge', 'conflict', 'lawsuit', 'legal action'
    ],
    high: [
      'attack', 'violence', 'violent', 'assault', 'weapon',
      'kill', 'hurt', 'harm', 'injure', 'damage', 'destroy', 
      'dangerous', 'unsafe', 'threatened', 'threatening'
    ],
    critical: [
      'gun', 'knife', 'bomb', 'explosive', 'murder', 'suicide',
      'die', 'death', 'deadly', 'lethal', 'fatal', 'shoot', 'stab',
      'terror', 'terrorist', 'hostage'
    ]
  };
  
  // Calculate threat level based on presence of keywords
  export const analyzeThreatLevel = (text: string): {
    level: 'none' | 'low' | 'medium' | 'high' | 'critical',
    score: number,
    keywords: string[]
  } => {
    if (!text) {
      return { level: 'none', score: 0, keywords: [] };
    }
    
    const lowerText = text.toLowerCase();
    let foundKeywords: string[] = [];
    
    // Check for critical keywords first
    for (const keyword of concerningKeywords.critical) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }
    
    if (foundKeywords.length > 0) {
      return { 
        level: 'critical', 
        score: Math.min(100, foundKeywords.length * 25), 
        keywords: foundKeywords 
      };
    }
    
    // Check for high concern keywords
    foundKeywords = [];
    for (const keyword of concerningKeywords.high) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }
    
    if (foundKeywords.length > 0) {
      return { 
        level: 'high', 
        score: Math.min(75, 50 + foundKeywords.length * 5), 
        keywords: foundKeywords 
      };
    }
    
    // Check for medium concern keywords
    foundKeywords = [];
    for (const keyword of concerningKeywords.medium) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }
    
    if (foundKeywords.length > 0) {
      return { 
        level: 'medium', 
        score: Math.min(50, 25 + foundKeywords.length * 5), 
        keywords: foundKeywords 
      };
    }
    
    // Check for low concern keywords
    foundKeywords = [];
    for (const keyword of concerningKeywords.low) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }
    
    if (foundKeywords.length > 0) {
      return { 
        level: 'low', 
        score: Math.min(25, foundKeywords.length * 5), 
        keywords: foundKeywords 
      };
    }
    
    return { level: 'none', score: 0, keywords: [] };
  };
  