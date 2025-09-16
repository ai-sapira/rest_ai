import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/hooks/useNavigationTransition";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <Footer />
    </motion.div>
  );
};

export default Index;
