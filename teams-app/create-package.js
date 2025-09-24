const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

async function createTeamsPackage() {
  console.log('Creating Microsoft Teams app package...');

  // Create output stream
  const output = fs.createWriteStream(path.join(__dirname, 'career-canvas-teams-app.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  // Listen for all archive data to be written
  output.on('close', function() {
    console.log(`Teams app package created: ${archive.pointer()} total bytes`);
    console.log('Package: career-canvas-teams-app.zip');
    console.log('');
    console.log('Next steps:');
    console.log('1. Upload the .zip file to Teams App Studio or Developer Portal');
    console.log('2. Configure the app URLs to point to your deployed React app');
    console.log('3. Install the app in your Teams environment');
  });

  // Listen for warnings
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn('Warning:', err);
    } else {
      throw err;
    }
  });

  // Listen for errors
  archive.on('error', function(err) {
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add files to the archive
  archive.file(path.join(__dirname, 'manifest.json'), { name: 'manifest.json' });
  
  // Add placeholder icons (in a real app, these would be actual PNG files)
  archive.append('Placeholder for color icon (192x192 PNG)', { name: 'color.png' });
  archive.append('Placeholder for outline icon (32x32 PNG)', { name: 'outline.png' });

  // Finalize the archive
  await archive.finalize();
}

// Run the package creation
createTeamsPackage().catch(console.error);