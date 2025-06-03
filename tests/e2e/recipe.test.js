// tests/e2e/recipe.test.js - Simplified version
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

describe('Recipe App E2E Tests', () => {
  let browser, page, server;
  const PORT = 3002;

  beforeAll(async () => {
    // Start server as separate process
    const serverPath = path.join(__dirname, '../../src/server.js');
    server = spawn('node', [serverPath], {
      env: { ...process.env, PORT: PORT },
      stdio: 'pipe'
    });

    // Wait for server to be ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 15000);

      let serverReady = false;
      
      server.stdout.on('data', (data) => {
        console.log('Server output:', data.toString());
        if (data.toString().includes('Server berjalan') || data.toString().includes('listening')) {
          if (!serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            resolve();
          }
        }
      });

      server.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      server.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      // Fallback - assume server is ready after 5 seconds
      const fallbackTimeout = setTimeout(() => {
        if (!serverReady) {
          serverReady = true;
          clearTimeout(timeout);
          resolve();
        }
      }, 5000);
      
      // Make sure to clear the fallback timeout when server is ready
      server.on('close', () => {
        clearTimeout(fallbackTimeout);
      });
    });

    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
  }, 30000);

  afterAll(async () => {
    // Keep browser open until user input
    if (process.env.KEEP_BROWSER_OPEN === 'true') {
      console.log('Browser will stay open until you press any key in this console...');
      console.log('Press any key to close the browser and end the test...');
      
      // Setup readline interface
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Wait for user input
      await new Promise(resolve => {
        rl.question('', () => {
          rl.close();
          resolve();
        });
      });
    }
    
    // Close browser
    if (browser) {
      await browser.close();
    }
    
    // Then close server
    if (server && server.pid) {
      return new Promise((resolve) => {
        server.on('close', () => {
          console.log('Test server ditutup');
          resolve();
        });
        
        server.kill('SIGTERM');
        
        // Fallback if close event doesn't fire
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    }
  });

  test('should be able to connect to the server', async () => {
    // Simple connectivity test
    await page.goto(`http://localhost:${PORT}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should search for a recipe and display results', async () => {
    // Helper function untuk jeda
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const STEP_DELAY = 10000; // 10 detik
    
    console.log('Langkah 1: Membuka halaman utama');
    // Navigate to the homepage
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await delay(STEP_DELAY);
    
    console.log('Langkah 2: Menunggu input bahan muncul');
    // Wait for the ingredients input to be visible
    await page.waitForSelector('#ingredients');
    await delay(STEP_DELAY);
    
    console.log('Langkah 3: Mengisi input bahan dengan "chicken"');
    // Type a search query
    await page.type('#ingredients', 'chicken', { delay: 100 }); // Mengetik lebih lambat
    await delay(STEP_DELAY);
    
    console.log('Langkah 4: Mengklik tombol cari resep');
    // Click the search button (submit button)
    await page.click('#recipe-form button[type="submit"]');
    await delay(STEP_DELAY);
    
    console.log('Langkah 5: Menunggu loading menghilang');
    // Wait for loading to disappear
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && loading.style.display === 'none';
    }, { timeout: 15000 });
    await delay(STEP_DELAY);
    
    console.log('Langkah 6: Menunggu hasil resep muncul');
    // Wait for recipe output to be visible
    await page.waitForFunction(() => {
      const output = document.getElementById('recipe-output');
      return output && output.style.display === 'block';
    }, { timeout: 5000 });
    await delay(STEP_DELAY);
    
    console.log('Langkah 7: Memverifikasi hasil resep');
    // Verify that recipe results are displayed
    const recipeContent = await page.$eval('#recipe-output', el => el.innerHTML);
    expect(recipeContent).toBeTruthy();
    expect(recipeContent.length).toBeGreaterThan(0);
    await delay(STEP_DELAY);
    
    console.log('Langkah 8: Mengambil screenshot hasil');
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/e2e/screenshots/recipe-results.png' });
    await delay(STEP_DELAY);
    
    console.log('Pengujian pencarian resep selesai');
  }, 120000); // Meningkatkan timeout menjadi 120 detik

  test('should show error message when no recipes found', async () => {
    // Helper function untuk jeda
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const STEP_DELAY = 10000; // 10 detik
    
    console.log('Langkah 1: Membuka halaman utama untuk tes error');
    // Navigate to the homepage
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await delay(STEP_DELAY);
    
    console.log('Langkah 2: Menunggu input bahan muncul');
    // Wait for the ingredients input to be visible
    await page.waitForSelector('#ingredients');
    await delay(STEP_DELAY);
    
    console.log('Langkah 3: Mengisi input dengan bahan yang tidak ada');
    // Type a search query that won't return results
    await page.type('#ingredients', 'xyznonexistentrecipe123', { delay: 100 }); // Mengetik lebih lambat
    await delay(STEP_DELAY);
    
    console.log('Langkah 4: Mengklik tombol cari resep');
    // Click the search button (submit button)
    await page.click('#recipe-form button[type="submit"]');
    await delay(STEP_DELAY);
    
    console.log('Langkah 5: Menunggu loading menghilang');
    // Wait for loading to disappear
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && loading.style.display === 'none';
    }, { timeout: 15000 });
    await delay(STEP_DELAY);
    
    console.log('Langkah 6: Menunggu pesan error muncul');
    // Wait for recipe output to be visible
    await page.waitForFunction(() => {
      const output = document.getElementById('recipe-output');
      return output && output.style.display === 'block';
    }, { timeout: 5000 });
    await delay(STEP_DELAY);
    
    console.log('Langkah 7: Memverifikasi pesan error');
    // Verify error message content
    const errorContent = await page.$eval('#recipe-output', el => el.textContent);
    expect(errorContent).toContain('Tidak ada resep ditemukan');
    await delay(STEP_DELAY);
    
    console.log('Langkah 8: Mengambil screenshot hasil error');
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/e2e/screenshots/no-results.png' });
    await delay(STEP_DELAY);
    
    console.log('Pengujian pesan error selesai');
  }, 120000); // Meningkatkan timeout menjadi 120 detik
});
