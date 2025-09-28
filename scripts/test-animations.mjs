#!/usr/bin/env node

/**
 * Test script to verify animations and performance optimizations
 * Run with: node scripts/test-animations.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎬 Testing Photography Portfolio Animations & Performance\n');

// Test 1: Check if critical files exist
console.log('📁 Checking critical files...');
const criticalFiles = [
  'index.html',
  'src/css/style.css',
  'src/js/lazy-observer.js',
  'src/js/performance.js',
  'tailwind.config.js'
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  const filePath = join(projectRoot, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some critical files are missing. Please check the file structure.');
  process.exit(1);
}

// Test 2: Check CSS for animation classes
console.log('\n🎨 Checking CSS animations...');
const cssPath = join(projectRoot, 'src/css/style.css');
const cssContent = readFileSync(cssPath, 'utf8');

const requiredAnimations = [
  '.fade-in',
  '.slide-in',
  '.scale-in',
  '.portfolio-item',
  '.parallax-bg',
  'will-change',
  'transform3d',
  'prefers-reduced-motion'
];

let animationsFound = 0;
requiredAnimations.forEach(animation => {
  if (cssContent.includes(animation)) {
    console.log(`✅ ${animation}`);
    animationsFound++;
  } else {
    console.log(`❌ ${animation} - NOT FOUND`);
  }
});

// Test 3: Check JavaScript for performance optimizations
console.log('\n⚡ Checking JavaScript optimizations...');
const jsPath = join(projectRoot, 'src/js/lazy-observer.js');
const jsContent = readFileSync(jsPath, 'utf8');

const requiredJSFeatures = [
  'IntersectionObserver',
  'prefers-reduced-motion',
  'requestAnimationFrame',
  'throttle',
  'will-change',
  'parallax'
];

let jsFeaturesFound = 0;
requiredJSFeatures.forEach(feature => {
  if (jsContent.includes(feature)) {
    console.log(`✅ ${feature}`);
    jsFeaturesFound++;
  } else {
    console.log(`❌ ${feature} - NOT FOUND`);
  }
});

// Test 4: Check HTML for performance optimizations
console.log('\n🌐 Checking HTML optimizations...');
const htmlPath = join(projectRoot, 'index.html');
const htmlContent = readFileSync(htmlPath, 'utf8');

const requiredHTMLFeatures = [
  'preload',
  'dns-prefetch',
  'loading="lazy"',
  'fetchpriority',
  'parallax-container',
  'slide-in',
  'scale-in'
];

let htmlFeaturesFound = 0;
requiredHTMLFeatures.forEach(feature => {
  if (htmlContent.includes(feature)) {
    console.log(`✅ ${feature}`);
    htmlFeaturesFound++;
  } else {
    console.log(`❌ ${feature} - NOT FOUND`);
  }
});

// Test 5: Check Tailwind config for purging
console.log('\n🎯 Checking Tailwind configuration...');
const tailwindPath = join(projectRoot, 'tailwind.config.js');
const tailwindContent = readFileSync(tailwindPath, 'utf8');

const requiredTailwindFeatures = [
  'purge',
  'safelist',
  'animation',
  'keyframes',
  'performance'
];

let tailwindFeaturesFound = 0;
requiredTailwindFeatures.forEach(feature => {
  if (tailwindContent.includes(feature)) {
    console.log(`✅ ${feature}`);
    tailwindFeaturesFound++;
  } else {
    console.log(`❌ ${feature} - NOT FOUND`);
  }
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`Files: ${criticalFiles.length - (criticalFiles.length - criticalFiles.length)}/${criticalFiles.length} ✅`);
console.log(`CSS Animations: ${animationsFound}/${requiredAnimations.length} ✅`);
console.log(`JS Features: ${jsFeaturesFound}/${requiredJSFeatures.length} ✅`);
console.log(`HTML Optimizations: ${htmlFeaturesFound}/${requiredHTMLFeatures.length} ✅`);
console.log(`Tailwind Config: ${tailwindFeaturesFound}/${requiredTailwindFeatures.length} ✅`);

const totalScore = (animationsFound + jsFeaturesFound + htmlFeaturesFound + tailwindFeaturesFound) / 
                   (requiredAnimations.length + requiredJSFeatures.length + requiredHTMLFeatures.length + requiredTailwindFeatures.length);

console.log(`\n🎯 Overall Score: ${Math.round(totalScore * 100)}%`);

if (totalScore >= 0.9) {
  console.log('\n🎉 Excellent! Your photography portfolio is optimized for performance and smooth animations.');
} else if (totalScore >= 0.7) {
  console.log('\n👍 Good! Most optimizations are in place, but there\'s room for improvement.');
} else {
  console.log('\n⚠️  Some optimizations are missing. Please review the failed checks above.');
}

console.log('\n🚀 Ready to test in browser! Open index.html to see the animations in action.');
