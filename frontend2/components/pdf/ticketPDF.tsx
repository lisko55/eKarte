import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Definiramo stilove (slično CSS-u)
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  ticketContainer: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    marginBottom: 20,
    padding: 0,
    flexDirection: "row",
    height: 180,
  },
  leftSection: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
    borderRight: "2px dashed #cbd5e1",
  },
  rightSection: {
    width: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  eventName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    marginTop: 5,
  },
  value: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "medium",
  },
  priceTag: {
    marginTop: 10,
    fontSize: 16,
    color: "#16a34a", // Zelena boja
    fontWeight: "bold",
  },
  qrCode: {
    width: 100,
    height: 100,
  },
  idText: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 5,
    fontFamily: "Courier",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#94a3b8",
  },
});

interface TicketProps {
  tickets: {
    eventName: string;
    ticketType: string;
    price: number;
    qrCodeDataUrl: string;
    uniqueId: string;
  }[];
  orderId: string;
}

// Komponenta koja kreira PDF dokument
export const TicketPDF = ({ tickets, orderId }: TicketProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text
        style={{
          fontSize: 24,
          marginBottom: 20,
          textAlign: "center",
          color: "#0f172a",
        }}
      >
        Vaše Ulaznice
      </Text>
      <Text
        style={{
          fontSize: 12,
          marginBottom: 30,
          textAlign: "center",
          color: "#64748b",
        }}
      >
        Narudžba #{orderId}
      </Text>

      {tickets.map((ticket, index) => (
        <View key={index} style={styles.ticketContainer}>
          {/* LIJEVA STRANA - INFORMACIJE */}
          <View style={styles.leftSection}>
            <View>
              <Text style={styles.eventName}>{ticket.eventName}</Text>
              <Text style={styles.label}>Tip ulaznice</Text>
              <Text style={styles.value}>{ticket.ticketType}</Text>
            </View>

            <View>
              <Text style={styles.priceTag}>{ticket.price} KM</Text>
              <Text style={{ fontSize: 10, color: "#ef4444", marginTop: 5 }}>
                JEDNOKRATNI ULAZ
              </Text>
            </View>
          </View>

          {/* DESNA STRANA - QR KOD */}
          <View style={styles.rightSection}>
            <Image src={ticket.qrCodeDataUrl} style={styles.qrCode} />
            <Text style={styles.idText}>
              #{ticket.uniqueId.split("-").pop()}
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.footer}>Hvala na povjerenju! eKarte Platforma.</Text>
    </Page>
  </Document>
);
