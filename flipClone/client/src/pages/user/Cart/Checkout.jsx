import { useState, useEffect } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { CreditCard, Security, Lock, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const Checkout = () => {
  const [cashfree, setCashfree] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
//    const { id } = useParams();
   const sessionId = searchParams.get("id")
   const total = searchParams.get("total")

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const cashfreeInstance = await load({
          mode: "sandbox",
        });
        setCashfree(cashfreeInstance);
        setSdkLoaded(true);
      } catch (error) {
        console.error("Failed to load Cashfree SDK:", error);
        setError("Failed to initialize payment system");
      }
    };
    initializeSDK();
  }, []);

  const doPayment = async () => {
    if (!cashfree) {
      setError("Payment system not ready. Please try again.");
      return;
    }

    if (!sessionId) {
      setError("Invalid session. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      };

      await cashfree.checkout(checkoutOptions);
    } catch (error) {
      console.error("Payment failed:", error);
      setError("Failed to process payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log('click')
    navigate(`/user/place-order`)
  }

  return (
    <div className="w-full pt-8 md:pt-0">
    <Box sx={{ maxWidth: 500, margin: "0 auto", p: 2 }}>
         
      <Card elevation={3}>
        <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{ ml: 2,mt:1, color: 'text.secondary' }}
      >
        Back
      </Button>
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          {/* Header */}
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="primary"
          >
            Complete Your Payment
          </Typography>

          {/* Total Amount Display */}
          {total && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ₹{total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Secure payment processed by Cashfree
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Security Badge */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "success.light",
              color: "white",
              borderRadius: 2,
            }}
          >
            <Grid
              container
              alignItems="center"
              spacing={1}
              justifyContent="center"
            >
              <Grid item>
                <Lock sx={{ fontSize: 20 }} />
              </Grid>
              <Grid item>
                <Typography variant="body2" fontWeight="bold">
                  256-BIT SSL SECURED PAYMENT
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Payment Methods Info */}
          <Box
            sx={{ mb: 3, p: 2, backgroundColor: "grey.50", borderRadius: 2 }}
          >
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Accepted Payment Methods
            </Typography>
            <Grid container spacing={1} justifyContent="center" sx={{ mt: 1 }}>
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  💳 Credit/Debit Cards
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  📱 UPI
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  🏦 Net Banking
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Pay Now Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={doPayment}
            disabled={isLoading || !sdkLoaded}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <CreditCard />
            }
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: 2,
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-1px)",
                transition: "all 0.2s",
              },
            }}
          >
            {isLoading
              ? "Processing..."
              : `Pay ₹${total ? total.toLocaleString() : "Now"}`}
          </Button>

          {/* Loading State */}
          {!sdkLoaded && !error && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Initializing payment gateway...
              </Typography>
            </Box>
          )}

          {/* Security Footer */}
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "grey.200" }}>
            <Grid
              container
              alignItems="center"
              spacing={1}
              justifyContent="center"
            >
              <Grid item>
                <Security color="success" sx={{ fontSize: 16 }} />
              </Grid>
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  Your payment details are secure and encrypted
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box></div>
  );
};

export default Checkout;

// import { load } from "@cashfreepayments/cashfree-js";

// const Checkout = ({ sessionId }) => {
//   let cashfree;
//   var initializeSDK = async function () {
//     cashfree = await load({
//       mode: "sandbox",
//     });
//   };
//   initializeSDK();

//   const doPayment = async () => {
//     let checkoutOptions = {
//       paymentSessionId: sessionId,
//       redirectTarget: "_self",
//     };
//     cashfree.checkout(checkoutOptions);
//   };

//   return (
//     <div class="row">
//       <p>Click below to open the checkout page in current tab</p>
//       <button
//         type="submit"
//         class="btn btn-primary"
//         id="renderBtn"
//         onClick={doPayment}
//       >
//         Pay Now
//       </button>
//     </div>
//   );
// };
// export default Checkout;
