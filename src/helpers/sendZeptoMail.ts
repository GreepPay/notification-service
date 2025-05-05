import axios from "axios";

export const sendZeptoMail = async ({
  to,
  name,
  subject,
  htmlbody,
}: {
  to: string;
  name: string;
  subject: string;
  htmlbody: string;
}) => {
  try {
    const response = await axios.post(
      "https://api.zeptomail.com/v1.1/email",
      {
        from: { address: "noreply@greep.io" },
        to: [
          {
            email_address: {
              address: to,
              name,
            },
          },
        ],
        subject,
        htmlbody,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `${process.env.SMTP_PASS}`,
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message || "Unknown error",
    };
  }
};