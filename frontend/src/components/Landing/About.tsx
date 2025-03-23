import { motion } from "framer-motion"
import { useInView } from "../../hooks/use-intersection-observer"
export function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="about" ref={ref} className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#4C1D95]/30 pointer-events-none"></div>

      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2
          className="text-3xl md:text-4xl font-bold mb-6 text-white inline-block relative"
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          <span className="relative z-10">About ONCampus</span>
          <motion.span
            className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-[#60A5FA]/40 to-[#818CF8]/40 rounded-full -z-10"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          ></motion.span>
        </h2>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#60A5FA]/10 to-[#818CF8]/10 rounded-3xl blur-xl"></div>
          <motion.div
            className="relative bg-white/5 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-white/10 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <motion.p
              className="text-lg md:text-xl text-gray-200 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            >
              ONCampus is a comprehensive campus guide designed specifically for Concordia University students, faculty,
              and visitors to navigate and explore both SGW and Loyola campuses with ease.
            </motion.p>

            <motion.div
              className="w-16 h-0.5 bg-gradient-to-r from-[#60A5FA] to-[#818CF8] mx-auto my-6 rounded-full"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />

            <motion.p
              className="text-lg md:text-xl text-gray-200 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            >
              ONCampus is a project developed by Concordia University students, for students, with the goal of making
              campus navigation intuitive and stress-free.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

