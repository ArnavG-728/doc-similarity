// export async function runAgentWorkflow({ 
//   jd_filename, 
//   jd_content, 
//   profiles_content, 
//   ar_email, 
//   recruiter_email 
// }: { 
//   jd_filename: string, 
//   jd_content: string,
//   profiles_content: Record<string, string>,
//   ar_email?: string, 
//   recruiter_email?: string 
// }) {
//   try {
//     console.log('🚀 Starting agent workflow request...');
//     console.log('📋 Request details:', {
//       jd_filename,
//       jd_content_length: jd_content.length,
//       profiles_count: Object.keys(profiles_content).length,
//       profile_names: Object.keys(profiles_content)
//     });

//     const requestBody = { 
//       jd_filename, 
//       jd_content, 
//       profiles_content, 
//       ar_email, 
//       recruiter_email 
//     };

//     console.log('📤 Sending request to backend...');
//     const response = await fetch('http://localhost:8000/run-agent', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestBody),
//     });

//     console.log('📥 Response received:', {
//       status: response.status,
//       statusText: response.statusText,
//       ok: response.ok
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ HTTP Error:', errorText);
//       throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//     }

//     const result = await response.json();
//     console.log('✅ Backend response:', result);
//     return result;
//   } catch (error) {
//     console.error('❌ Error calling backend:', error);
//     if (error instanceof TypeError && error.message.includes('fetch')) {
//       throw new Error('Cannot connect to backend server. Make sure it\'s running on http://localhost:8000');
//     }
//     throw error;
//   }
// }


















export async function runAgentWorkflow({ 
  jd_id, 
  jd_filename, 
  jd_content, 
  profiles_content, 
  ar_email, 
  recruiter_email, 
  user_id 
}: { 
  jd_id: string,
  jd_filename: string, 
  jd_content: string,
  profiles_content: Record<string, string>,
  ar_email?: string, 
  recruiter_email?: string,
  user_id: string
}) {
  try {
    console.log('🚀 Starting agent workflow request...');
    const requestBody = { 
      jd_id,
      jd_filename, 
      jd_content, 
      profiles_content, 
      ar_email, 
      recruiter_email,
      created_by: user_id
    };

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE}/run-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof TypeError && (error as TypeError).message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Is it running and is NEXT_PUBLIC_API_BASE_URL set?');
    }
    throw error;
  }
}
