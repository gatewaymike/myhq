// Store app only: Android's web view cannot download a file, so exports are written to the app's
// cache folder and handed to the phone's share sheet (save to Files, Drive, email, LINE, ...).
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function shareFile(name: string, content: string): Promise<void> {
  const { uri } = await Filesystem.writeFile({
    path: name,
    data: content,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  try {
    await Share.share({ title: name, files: [uri] });
  } catch (e) {
    // Closing the share sheet without choosing an app is not a failure.
    if (!/cancel/i.test(String((e as Error)?.message ?? e))) throw e;
  }
}
