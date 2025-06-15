import request from "supertest";
import app from "../app"; // adjust path to your Express app

describe("POST /data/ttn", () => {
  it("should accept valid data and return success", async () => {
    const res = await request(app)
      .post("/data/ttn")
      .set("Authorization", "Bearer YOUR_API_TOKEN")
      .send({
        end_device_ids: {
          device_id: "example-device",
          dev_eui: "AB12CD34EF56GH78"
        },
        uplink_message: {
          decoded_payload: {
            temperature: 22.5,
            humidity: 55
          },
          settings: {
            time: "2024-06-01T12:00:00Z"
          },
          rx_metadata: [
            { rssi: -72 },
            { rssi: -74 }
          ]
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Success/i);
  });
});
