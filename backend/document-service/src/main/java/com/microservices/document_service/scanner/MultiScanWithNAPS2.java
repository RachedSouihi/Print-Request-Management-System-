package com.microservices.document_service.scanner;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;

public class MultiScanWithNAPS2 {

    public static void main(String[] args) {
        // Vérification des arguments
        if (args.length == 0) {
            System.out.println("⚠️ Aucune valeur passée pour le nombre de documents à scanner.");
            return;
        }

        // Chemin vers NAPS2.Console.exe
        String naps2ConsolePath = "C:\\outils\\naps2\\naps2-8.1.4-win-x64\\App\\NAPS2.Console.exe";
        String scanProfileName = "default";

        // Vérifier si un scanner est connecté
        if (!isScannerConnected()) {
            System.out.println("❌ Aucun scanner n'est connecté. Veuillez connecter un scanner.");
            return;
        }

        // Nombre de scans à faire
        int numberOfScans = Integer.parseInt(args[0]);

        for (int i = 1; i <= numberOfScans; i++) {
            String outputFilePath = "C:\\outils\\naps2\\scans\\scan_" + i + ".pdf";
            String command = String.format("\"%s\" --autosave --profile \"%s\" --output \"%s\"",
                    naps2ConsolePath, scanProfileName, outputFilePath);

            System.out.println("\n📄 Scan du document " + i + " en cours...");
            try {
                Process process = Runtime.getRuntime().exec(command);
                int exitCode = process.waitFor();

                if (exitCode == 0) {
                    System.out.println("✅ Scan " + i + " enregistré à : " + outputFilePath);

                    // Envoi du fichier au backend
                    uploadFile(outputFilePath, i);

                } else {
                    System.out.println("❌ Échec du scan " + i + ". Code de sortie : " + exitCode);
                }

            } catch (IOException | InterruptedException e) {
                System.out.println("❌ Erreur lors du scan " + i);
                e.printStackTrace();
            }
        }

        System.out.println("\n📦 Tous les scans sont terminés.");
    }

    // Méthode de vérification si le scanner est connecté
    private static boolean isScannerConnected() {
        // À personnaliser selon l'environnement.
        // Ici on peut implémenter une détection plus intelligente si besoin.
        File naps2Exe = new File("C:\\outils\\naps2\\naps2-8.1.4-win-x64\\App\\NAPS2.Console.exe");
        return naps2Exe.exists(); // Remplacer ceci si tu peux faire mieux
    }

    // Méthode d'envoi HTTP multipart
    private static void uploadFile(String filePath, int scanIndex) {
        try {
            File fileToUpload = new File(filePath);
            String boundary = "===" + System.currentTimeMillis() + "===";
            URL url = new URL("http://localhost:8082/doc/admindoc/upload");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoOutput(true);
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            OutputStream outputStream = connection.getOutputStream();
            PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, "UTF-8"), true);

            // Fichier
            writer.append("--" + boundary + "\r\n");
            writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileToUpload.getName() + "\"\r\n");
            writer.append("Content-Type: application/pdf\r\n\r\n").flush();
            Files.copy(fileToUpload.toPath(), outputStream);
            outputStream.flush();
            writer.append("\r\n").flush();

            // Métadonnées
            writer.append("--" + boundary + "\r\n");
            writer.append("Content-Disposition: form-data; name=\"title\"\r\n\r\n");
            writer.append("Scan_" + scanIndex + "\r\n").flush();

            writer.append("--" + boundary + "\r\n");
            writer.append("Content-Disposition: form-data; name=\"type\"\r\n\r\n");
            writer.append("pdf\r\n").flush();

            writer.append("--" + boundary + "\r\n");
            writer.append("Content-Disposition: form-data; name=\"visibility\"\r\n\r\n");
            writer.append("publique\r\n").flush();

            writer.append("--" + boundary + "\r\n");
            writer.append("Content-Disposition: form-data; name=\"message\"\r\n\r\n");
            writer.append("Document scanné automatiquement\r\n").flush();

            writer.append("--" + boundary + "\r\n");
            writer.append("Content-Disposition: form-data; name=\"author\"\r\n\r\n");
            writer.append("scanner_admin\r\n").flush();

            writer.append("--" + boundary + "--\r\n").flush();
            writer.close();

            // Lire la réponse du serveur
            int responseCode = connection.getResponseCode();
            System.out.println("📬 Réponse du serveur : " + responseCode);

            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();
            System.out.println("📥 Réponse : " + response.toString());

        } catch (IOException e) {
            System.out.println("❌ Erreur lors de l'envoi du fichier scanné.");
            e.printStackTrace();
        }
    }
}
