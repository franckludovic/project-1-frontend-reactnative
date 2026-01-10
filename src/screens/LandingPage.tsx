import React from 'react';
import { ScrollView, SafeAreaView, View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Mockup from '../components/Mockup';
import FeaturesList from '../components/FeaturesList';
import Testimonial from '../components/Testimonial';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

type Props = {
  onGetStarted?: () => void;
  onViewDemo?: () => void;
};

const HomeScreen: React.FC<Props> = ({ onGetStarted, onViewDemo }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Header />
        <Hero onGetStarted={onGetStarted} onViewDemo={onViewDemo} />
        <Mockup />
        <View style={styles.sectionHeader}><View style={{ height: 12 }} /></View>
        <View style={styles.featuresWrap}> 
          <View style={styles.sectionTitle} />
          <FeaturesList />
        </View>
        <Testimonial />
        <CTA />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingTop: 40, paddingBottom: 40 },
  sectionHeader: { paddingHorizontal: 20 },
  featuresWrap: { paddingTop: 8 },
  sectionTitle: { height: 6 },
});

export default HomeScreen;
