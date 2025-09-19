import bcrypt from "bcrypt";

const hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log(`Error in hashing password- ${error}`);
    }
};

const comparePassword = async (password, hashedPassword) => {
    try {
        return bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.log(`Error in comparing password- ${error}`);
    }
};

export {
    hashPassword,
    comparePassword,
}