import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { translateText } from '../functions/api/translation-service';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TestCase {
  description: string;
  input: string;
  expected_patterns: string[];
}

interface TestMetadata {
  version: string;
  rules: {
    forbidden_chars: string[];
    required_elements: string[];
  };
}

interface TestSuite {
  metadata: TestMetadata;
  test_cases: TestCase[];
}

async function runTests() {
  // Load test cases
  const testSuite: TestSuite = JSON.parse(
    readFileSync(join(__dirname, 'translation-test-cases.json'), 'utf-8')
  );

  // Load API key from environment
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('❌ DEEPSEEK_API_KEY environment variable is not set');
    process.exit(1);
  }

  console.log('Starting translation tests...\n');
  let passCount = 0;
  let failCount = 0;

  for (const testCase of testSuite.test_cases) {
    console.log(`Test: ${testCase.description}`);
    console.log(`Input: ${testCase.input}`);

    try {
      const result = await translateText(testCase.input, apiKey);
      
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
        failCount++;
        continue;
      }

      const translation = result.translated_text;
      console.log(`Output: ${translation}`);

      // Initialize scoring
      let score = 0;
      const maxScore = (testCase.expected_patterns.length || 0) + 
                      (testCase.required_english_patterns?.length || 0);
      const threshold = Math.ceil(maxScore * testSuite.metadata.rules.scoring.threshold);
      
      // Check for forbidden characters (hiragana/katakana)
      const hasHiragana = /[ぁ-ん]/.test(translation);
      const hasKatakana = /[ァ-ン]/.test(translation);
      const hasForbiddenChars = hasHiragana || hasKatakana;
      
      if (hasForbiddenChars) {
        score += testSuite.metadata.rules.scoring.points.forbidden_chars;
      }
      
      // Check for expected kanji patterns
      const kanjiMatches = testCase.expected_patterns.map(pattern => ({
        pattern,
        found: translation.includes(pattern)
      }));
      
      // Add points for found kanji patterns
      kanjiMatches.forEach(match => {
        if (match.found) {
          score += testSuite.metadata.rules.scoring.points.required_kanji;
        }
      });
      
      // Check for required English patterns
      const englishMatches = (testCase.required_english_patterns || []).map(pattern => ({
        pattern,
        found: translation.includes(pattern)
      }));
      
      // Add points for found English patterns
      englishMatches.forEach(match => {
        if (match.found) {
          score += testSuite.metadata.rules.scoring.points.required_english;
        }
      });

      // Evaluate test results
      const passed = score >= threshold && !hasForbiddenChars;
      
      if (passed) {
        console.log('✅ Test passed');
        console.log(`Score: ${score}/${maxScore} (threshold: ${threshold})`);
        if (!hasForbiddenChars) {
          console.log('- No hiragana/katakana found');
        }
        console.log('\nFound patterns:');
        kanjiMatches
          .filter(p => p.found)
          .forEach(p => console.log(`- Kanji: ${p.pattern}`));
        englishMatches
          .filter(p => p.found)
          .forEach(p => console.log(`- English: ${p.pattern}`));
        passCount++;
      } else {
        console.log('❌ Test failed');
        console.log(`Score: ${score}/${maxScore} (threshold: ${threshold})`);
        
        if (hasForbiddenChars) {
          console.log('- Contains forbidden characters (hiragana/katakana)');
        }
        
        if (kanjiMatches.some(p => !p.found)) {
          console.log('\nMissing kanji patterns:');
          kanjiMatches
            .filter(p => !p.found)
            .forEach(p => console.log(`- ${p.pattern}`));
        }
        
        if (englishMatches.some(p => !p.found)) {
          console.log('\nMissing English patterns:');
          englishMatches
            .filter(p => !p.found)
            .forEach(p => console.log(`- ${p.pattern}`));
        }
        failCount++;
      }
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failCount++;
    }

    console.log('\n---\n');
  }

  console.log('Test Summary:');
  console.log(`Total: ${testSuite.test_cases.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
