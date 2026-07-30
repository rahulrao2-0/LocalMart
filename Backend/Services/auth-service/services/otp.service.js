import { redis } from "@localmart/shared";

export const storeOTP = async (email, otp) => {
    await redis.set(`otp:${email}`, otp, {
        EX: 300,
    });
};

export const getOTP = async (email) => {
    return await redis.get(`otp:${email}`);
};

export const deleteOTP = async (email) => {
    await redis.del(`otp:${email}`);
};