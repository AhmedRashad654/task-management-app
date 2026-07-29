export function projectInvitationEmail(
  projectName: string,
  invitedByName: string,
): { subject: string; html: string } {
  const subject = `You've been added to ${projectName}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9f9f9;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #eaeaea;
        }
        .header {
          background-color: #4F46E5;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          color: #555555;
          margin-bottom: 20px;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid #eaeaea;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Task Management</h1>
        </div>

        <div class="content">
          <h2>Project Invitation</h2>
          <p>${invitedByName} has added you to the project <strong>${projectName}</strong>.</p>
          <p>You can now collaborate on tasks and manage the project together.</p>
        </div>

        <div class="footer">
          <p>&copy; 2026 Task Management App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

export function newUserProjectInvitationEmail(
  projectName: string,
  invitedByName: string,
  otp: string,
  resetLink: string,
): { subject: string; html: string } {
  const subject = `You've been invited to join ${projectName}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Invitation</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9f9f9;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #eaeaea;
        }
        .header {
          background-color: #4F46E5;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          color: #555555;
          margin-bottom: 20px;
        }
        .otp-box {
          display: inline-block;
          background-color: #f3f3f3;
          border: 2px dashed #4F46E5;
          color: #4F46E5;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 6px;
          padding: 15px 40px;
          border-radius: 8px;
          margin: 10px 0 30px 0;
        }
        .reset-btn {
          display: inline-block;
          background-color: #4F46E5;
          color: #000;
          text-decoration: none;
          padding: 14px 36px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          margin: 10px 0 20px 0;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid #eaeaea;
        }
        .warning {
          font-size: 13px;
          color: #999999;
          margin-top: 20px;
          border-top: 1px solid #eeeeee;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Task Management</h1>
        </div>

        <div class="content">
          <h2>Welcome to ${projectName}</h2>
          <p>${invitedByName} has invited you to join the project <strong>${projectName}</strong>.</p>
          <p>To get started, please set your password using the verification code below or click the button. This code is valid for 15 minutes.</p>

          <div class="otp-box">${otp}</div>

          <p style="margin-bottom: 10px;">Or click the button below:</p>
          <a href="${resetLink}" class="reset-btn">Set Your Password</a>

          <p class="warning">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>

        <div class="footer">
          <p>&copy; 2026 Task Management App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
