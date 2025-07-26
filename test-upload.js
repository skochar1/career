const fs = require('fs');
const path = require('path');

async function testResumeUpload(resumeFilePath) {
  try {
    console.log(`Testing upload of: ${resumeFilePath}`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(resumeFilePath);
    const fileName = path.basename(resumeFilePath);
    
    // Create FormData
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('resume', fileBuffer, {
      filename: fileName,
      contentType: 'text/plain'
    });
    formData.append('sessionId', `test_session_${Date.now()}`);
    
    // Make the request
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000/api/upload-resume', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 200) {
      const parsedResult = JSON.parse(result);
      console.log('\n✅ Upload successful!');
      console.log('Parsed skills:', parsedResult.parsedData?.skills);
      console.log('Experience level:', parsedResult.parsedData?.experienceLevel);
      console.log('Summary:', parsedResult.parsedData?.summary);
    } else {
      console.log('\n❌ Upload failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test with software engineer resume
testResumeUpload('./test-resumes/software-engineer.txt');