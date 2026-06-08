import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

export const emailService = {
    async sendNewAccountEmail(email: string, name: string, username: string, plainPassword: string) {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'test@gmail.com',
            to: email,
            subject: 'Tài khoản nhân viên được tạo',
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #F5F8FF; padding: 40px 20px; color: #0B3C60;">
                <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%); padding: 24px; text-align: center; border-bottom: 2px solid #FFDFBA;">
                        <h2 style="margin: 0; font-size: 20px; color: #ff5a3c; text-transform: uppercase;">Thông tin tài khoản</h2>
                    </div>
                    <div style="padding: 32px 24px;">
                        <p style="margin-top: 0; font-size: 16px;">Xin chào <strong>${name}</strong>,</p>
                        <p>Tài khoản nhân viên của bạn đã được khởi tạo thành công trên hệ thống. Dưới đây là thông tin đăng nhập của bạn:</p>
                        
                        <div style="background: #e8f0fe; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px dashed #FFB3BA;">
                            <p style="margin: 0 0 8px 0;"><strong>Tên đăng nhập:</strong> <span style="color: #ff5a3c; font-weight: bold; font-size: 16px;">${username}</span></p>
                            <p style="margin: 0;"><strong>Mật khẩu:</strong> <span style="color: #ff5a3c; font-weight: bold; font-size: 16px;">${plainPassword}</span></p>
                        </div>
                        
                        <p style="margin-bottom: 24px; color: #333; font-size: 14px;"><em>* Vui lòng đăng nhập và đổi mật khẩu càng sớm càng tốt để bảo mật hệ thống.</em></p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="#" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #FFDFBA 0%, #FFB3BA 100%); color: #0B3C60; text-decoration: none; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 4px rgba(0,0,0,0.15);">Trang Đăng Nhập</a>
                        </div>
                    </div>
                </div>
            </div>`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Lỗi gửi email:', error);
            console.log('----------------------------');

            console.log(mailOptions);
            console.log('----------------------------');
        }
    }
};
