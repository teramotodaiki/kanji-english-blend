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

      // Check for forbidden characters (hiragana/katakana)
      const hasHiragana = /[ぁ-ん]/.test(translation);
      const hasKatakana = /[ァ-ン]/.test(translation);
      
      // Check for expected kanji patterns
      const patternMatches = testCase.expected_patterns.map(pattern => ({
        pattern,
        found: translation.includes(pattern)
      }));

      const allPatternsFound = patternMatches.every(p => p.found);
      const noForbiddenChars = !hasHiragana && !hasKatakana;

      if (allPatternsFound && noForbiddenChars) {
        console.log('✅ Test passed');
        console.log('- No hiragana/katakana found');
        console.log('- All expected patterns found');
        passCount++;
      } else {
        console.log('❌ Test failed');
        if (hasHiragana || hasKatakana) {
          console.log('- Contains forbidden characters (hiragana/katakana)');
        }
        if (!allPatternsFound) {
          console.log('Missing patterns:');
          patternMatches
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
