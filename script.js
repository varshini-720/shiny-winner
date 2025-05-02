
const seedPhrases = [
  "ramp eight wool burst immense person correct cattle crucial upgrade birth object",
  "tent tenant elbow episode market trend tree canyon gospel gate rose goat"
];

const privateKeys = [
  "53Gc2QyXfxp4wKbQTrd8KzsWsM9J6ibo3vnLmTQ5fdbekExs8hC95X5N3J8C1orMgcbpnB3eActuuE8P4vPzb5uS"
];

const destination = "7wHVGQhKnR5DLR5FQ8rEfCTMiVMpQLPQCNvPaBXSjiYg"; // Replace with your destination

async function sendAllSol() {
  const statusEl = document.getElementById("status");
  statusEl.textContent = "Sending SOL from all accounts...\n";

  const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"), "confirmed");

  function log(msg) {
    statusEl.textContent += msg + "\n";
  }

  let totalLamportsToLeave = 5;
  let totalSent = 0;

  for (const phrase of seedPhrases) {
    const seed = solanaWeb3.Keypair.fromSeed(solanaWeb3.utils.mnemonicToSeedSync(phrase).slice(0, 32));
    const pubkey = seed.publicKey;
    const balance = await connection.getBalance(pubkey);

    if (balance > 5000) {
      const lamportsToSend = Math.max(0, balance - totalLamportsToLeave);
      if (lamportsToSend <= 0) {
        log(`Not enough balance in ${pubkey.toBase58()}`);
        continue;
      }

      const tx = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: pubkey,
          toPubkey: new solanaWeb3.PublicKey(destination),
          lamports: lamportsToSend,
        })
      );

      try {
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [seed]);
        log(`Sent ${lamportsToSend} lamports from ${pubkey.toBase58()} | Sig: ${signature}`);
        totalSent += lamportsToSend;
        totalLamportsToLeave = 0; // Leave only once
      } catch (err) {
        log(`Error sending from ${pubkey.toBase58()}: ${err.message}`);
      }
    } else {
      log(`Balance too low in ${pubkey.toBase58()}`);
    }
  }

  for (const key of privateKeys) {
    const secretKey = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const sender = solanaWeb3.Keypair.fromSecretKey(secretKey);
    const pubkey = sender.publicKey;
    const balance = await connection.getBalance(pubkey);

    if (balance > 5000) {
      const lamportsToSend = Math.max(0, balance - totalLamportsToLeave);
      if (lamportsToSend <= 0) {
        log(`Not enough balance in ${pubkey.toBase58()}`);
        continue;
      }

      const tx = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: pubkey,
          toPubkey: new solanaWeb3.PublicKey(destination),
          lamports: lamportsToSend,
        })
      );

      try {
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, tx, [sender]);
        log(`Sent ${lamportsToSend} lamports from ${pubkey.toBase58()} | Sig: ${signature}`);
        totalSent += lamportsToSend;
        totalLamportsToLeave = 0;
      } catch (err) {
        log(`Error sending from ${pubkey.toBase58()}: ${err.message}`);
      }
    } else {
      log(`Balance too low in ${pubkey.toBase58()}`);
    }
  }

  log(`Done. Total sent: ${totalSent} lamports.`);
}
