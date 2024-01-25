import { Table, CloseButton, Button, Card } from "react-bootstrap";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { loescheProdukt } from "../redux/warenkorbSlice";
import { useEffect } from "react";
import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

export default function Warenkorb() {
  const dispatch = useDispatch();
  const warenkorb = useSelector((state) => state.warenkorb);
  const clientID =
    "AQOZdY3nyMh_wZSvDNwnvnSY2-fe5DybaTl2-rPZlDxssMUgozs5rB9vo8BGMEQBcCacX996EJ41bC7G";
  const [kasse, setKasse] = useState(false);

  const entfernen = (produkt) => {
    dispatch(loescheProdukt(produkt));
  };

  const amount = warenkorb.gesamtbetrag;
  const currency = "EUR";
  const style = { layout: "vertical" };

  const ButtonWrapper = ({ currency, showSpinner }) => {
    // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
      dispatch({
        type: "resetOptions",
        value: {
          ...options,
          currency: currency,
        },
      });
    }, [currency, showSpinner]);

    return (
      <>
        {showSpinner && isPending && <div className="spinner" />}
        <PayPalButtons
          style={style}
          disabled={false}
          forceReRender={[amount, currency, style]}
          fundingSource={undefined}
          createOrder={(data, actions) => {
            return actions.order
              .create({
                purchase_units: [
                  {
                    amount: {
                      currency_code: currency,
                      value: amount,
                    },
                  },
                ],
              })
              .then((orderId) => {
                // Your code here after create the order
                return orderId;
              });
          }}
          onApprove={function (data, actions) {
            return actions.order.capture().then(function (details) {
              console.log(details.purchase_units[0].shipping);
            });
          }}
        />
      </>
    );
  };

  return (
    <div>
      {warenkorb.wAnzahl === 0 ? (
        <h2>Der Warenkorb ist leer!</h2>
      ) : (
        <div>
          <h1>Warenkorb</h1>
          <div className="row mt-4">
            <div className="col-9">
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Bild</th>
                    <th>Name</th>
                    <th>Extras</th>
                    <th>Menge</th>
                    <th>Betrag</th>
                    <th>
                      <CloseButton disabled />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {warenkorb.produkte.map((produkt) => (
                    <tr key={produkt._id}>
                      <td>
                        <Image
                          src={produkt.bild}
                          alt={produkt.name}
                          width={50}
                          height={50}
                        />
                      </td>
                      <td>
                        <Link
                          className="text-danger"
                          href={`/produkte/${produkt.url}`}
                        >
                          {produkt.name}
                        </Link>
                      </td>
                      <td>
                        {produkt.extras.map((extra) => (
                          <span key={extra._id}>{extra.text} </span>
                        ))}
                      </td>
                      <td>{produkt.menge}</td>
                      <td>{(produkt.preis * produkt.menge).toFixed(2)}</td>
                      <td>
                        <Button
                          className="btn-sm"
                          onClick={() => entfernen(produkt)}
                        >
                          x
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="col-3 p-2">
              <div className="shadow">
                <Card>
                  <Card.Header as="h5">Gesamt</Card.Header>
                  <Card.Body className="text-center">
                    <Card.Title>{warenkorb.gesamtbetrag.toFixed(2)}</Card.Title>
                    {kasse ? (
                      <PayPalScriptProvider
                        options={{
                          "client-id": clientID,
                          components: "buttons",
                          currency: "EUR",
                          //"disable-funding":"sofort"
                        }}
                      >
                        <ButtonWrapper
                          currency={currency}
                          showSpinner={false}
                        />
                      </PayPalScriptProvider>
                    ) : (
                      <Button variant="primary" onClick={() => setKasse(true)}>
                        Zur Kasse
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
