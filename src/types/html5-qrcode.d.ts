// This file augments the 'html5-qrcode' module to include the 'getVideoDevices' static method,
// which might be missing from its default TypeScript declarations.
declare module "html5-qrcode" {
  export class Html5Qrcode {
    /**
     * Static method to get a list of all connected video input devices.
     * @returns A promise that resolves to an array of objects, each with 'id' and 'label' for the device.
     */
    static getVideoDevices(): Promise<Array<{ id: string; label: string }>>;
  }
}