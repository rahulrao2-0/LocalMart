import { redis } from "@localmart/shared";

class OtpService {
    async storeOTP(email, otp) {
        await redis.set(`otp:${email}`, otp, {
            EX: 300,
        });
    }

    async getOTP(email) {
        return await redis.get(`otp:${email}`);
    }

    async deleteOTP(email) {
        await redis.del(`otp:${email}`);
    }
}

export default new OtpService();