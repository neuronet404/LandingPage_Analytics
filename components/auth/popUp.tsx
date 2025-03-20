import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,

    DialogFooter,

    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react";


export function PopUpBoxTermsAndCondition() {

    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    const [isPrivacySubOpen, setIsPrivacySubOpen] = useState({
        introduction: false,
        information: false,
        usage: false,
        sharing: false,
        retention: false,
        rights: false,
        children: false,
        updates: false,
    });

    const [isTermsSubOpen, setIsTermsSubOpen] = useState({
        acceptance: false,
        obligations: false,
        intellectual: false,
        liability: false,
        indemnification: false,
        termination: false,
        dispute: false,
        modifications: false,
        finalProvisions: false,
    });

    const toggleTermsSection = (section) => {
        setIsTermsSubOpen((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    const toggleSection = (section) => {
        setIsPrivacySubOpen((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    const togglePrivacy = () => setIsPrivacyOpen(!isPrivacyOpen);
    const toggleTerms = () => setIsTermsOpen(!isTermsOpen);

    return (
        <Dialog >
            <DialogTrigger asChild>
                <button className="text-blue " >Terms of Service and Privacy Policy.</button>
            </DialogTrigger>
            <DialogContent className="max-md:w-11/12  w-9/12 h-[45vh] lg:h-[75vh] overflow-hidden my-8 ">
                {/* <DialogHeader>
                    <DialogTitle>  </DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader> */}
                <div className="grid gap-4 py-4 h-full">

                    <div className="bg-white  rounded-lg overflow-y-scroll h-[40vh] lg:h-[70vh] ">
                        {/* Privacy Policy Section */}
                        <div className="">
                            <button
                                onClick={togglePrivacy}
                                className="w-full  p-4 text-left font-bold text-xl"
                            >
                                Privacy Policy
                            </button>
                            {isPrivacyOpen && (
                                <div className=" ">
                                    <h2 className="text-sm px-4 font-medium">Effective Date: {new Date().toISOString().split('T')[0]}</h2>
                                    <p className="text-sm px-4">Last Updated: {new Date().toISOString().split('T')[0]}</p>

                                    <div className="w-full max-w-4xl mx-auto mt-2">
                                        <div className="bg-white  rounded-lg  h-fit">
                                            {/* Section 1: Introduction */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("introduction")}
                                                    className="w-full   p-4 text-left
                                                     font-semibold text-sm text-blue"
                                                >
                                                    1. Introduction
                                                </button>
                                                {isPrivacySubOpen.introduction && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>
                                                            Welcome to Acolyte (“we,” “our,” or “us”). Your privacy is critically
                                                            important to us. This Privacy Policy outlines how we collect, use, store, and
                                                            protect your information when you interact with our platform. By accessing
                                                            Acolyte, you consent to the data practices described herein.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 2: Information We Collect */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("information")}
                                                    className="w-full text-blue  text-sm p-4 text-left font-semibold"
                                                >
                                                    2. Information We Collect
                                                </button>
                                                {isPrivacySubOpen.information && (
                                                    <div className="p-4 border-t text-sm border-gray-200 ">
                                                        <h3 className="font-semibold ">A. Personal Information:</h3>
                                                        <p className="py-2">Name, email address, contact details, and account credentials provided upon
                                                            registration.</p>

                                                        <h3 className="font-semibold">B. User-Provided Content:</h3>
                                                        <p className="py-2">Documents, notes, study materials, and other files uploaded to the platform.</p>

                                                        <h3 className="font-semibold">C. Usage Data:</h3>
                                                        <p className="py-2">Interaction logs, analytics, and system activity to improve our AI services.</p>

                                                        <h3 className="font-semibold">D. Cookies and Tracking Technologies:</h3>
                                                        <p className="py-2">We use cookies and similar tracking technologies to enhance user experience and
                                                            monitor platform performance.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 3: How We Use Your Data */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("usage")}
                                                    className="w-full text-blue  p-4 text-sm text-left font-semibold"
                                                >
                                                    3. How We Use Your Data
                                                </button>
                                                {isPrivacySubOpen.usage && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>
                                                            We process your data for the following purposes:
                                                        </p>
                                                        <ul>
                                                            <li>Service Provision: To provide AI-driven educational enhancements, backtracking features, and personalized recommendations.</li>
                                                            <li>AI Model Improvement: User data may be used to enhance AI algorithms, but it will never be shared with third parties for unrelated purposes.</li>
                                                            <li>Security & Fraud Prevention: To detect and prevent unauthorized access or fraudulent activities.</li>
                                                            <li>Legal Compliance: To comply with applicable laws, regulations, or legal proceedings.</li>
                                                        </ul>
                                                        <p>Note: We do not validate or verify any user-uploaded content, nor do we guarantee its accuracy.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 4: Data Sharing & Third-Party Access */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("sharing")}
                                                    className="w-full text-blue text-sm p-4 text-left font-semibold"
                                                >
                                                    4. Data Sharing & Third-Party Access
                                                </button>
                                                {isPrivacySubOpen.sharing && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>Acolyte does not sell, rent, or trade personal information. We may share data in the following cases:</p>
                                                        <ul>
                                                            <li>Legal Compliance: If required by law enforcement or legal proceedings.</li>
                                                            <li>Service Providers: With trusted partners for infrastructure, hosting, and AI model refinement (under strict confidentiality agreements).</li>
                                                            <li>Business Transfers: In case of a merger, acquisition, or asset sale, data may be transferred to relevant parties.</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 5: Data Retention & Security */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("retention")}
                                                    className="w-full text-blue text-sm p-4 text-left font-semibold"
                                                >
                                                    5. Data Retention & Security
                                                </button>
                                                {isPrivacySubOpen.retention && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>User data is retained for as long as necessary to fulfill service requirements.</p>
                                                        <p>We implement industry-standard encryption, access controls, and security protocols to safeguard user information.</p>
                                                        <p>Users may request data deletion by contacting support@myacolyte.com, but certain anonymized data may persist for AI training.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 6: User Rights & Choices */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("rights")}
                                                    className="w-full text-blue text-sm p-4 text-left font-semibold"
                                                >
                                                    6. User Rights & Choices
                                                </button>
                                                {isPrivacySubOpen.rights && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <ul>
                                                            <li>Access & Correction: Request access to their personal data and correct inaccuracies.</li>
                                                            <li>Opt-Out: Withdraw consent for marketing communications.</li>
                                                            <li>Data Deletion: Request the deletion of their account and associated data.</li>
                                                        </ul>
                                                        <p>For inquiries, contact support@myacolyte.com.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 7: Children's Privacy */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("children")}
                                                    className="w-full text-blue  p-4 text-sm text-left font-semibold"
                                                >
                                                    7. Children&apos;s Privacy
                                                </button>
                                                {isPrivacySubOpen.children && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>Acolyte is not intended for individuals under 13 years old. We do not knowingly collect data from children. If we become aware of such data, we will promptly delete it.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 8: Policy Updates */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection("updates")}
                                                    className="w-full text-blue  p-4 text-sm text-left font-semibold"
                                                >
                                                    8. Policy Updates
                                                </button>
                                                {isPrivacySubOpen.updates && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>We may update this Privacy Policy periodically. Continued use of Acolyte after such updates constitutes acceptance of the revised terms.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Terms & Conditions Section */}
                        <div>
                            <button
                                onClick={toggleTerms}
                                className="w-full font-bold text-xl p-4 text-left "
                            >
                                Terms & Conditions
                            </button>
                            {isTermsOpen && (
                                <div className=" ">
                                    <h2 className="text-sm px-4 font-medium">Effective Date: {new Date().toISOString().split('T')[0]}</h2>
                                    <p className="text-sm px-4">Last Updated: {new Date().toISOString().split('T')[0]}</p>


                                    <div className="w-full max-w-4xl mx-auto mt-4">
                                        <div className="bg-white  rounded-lg overflow-hidden">
                                            {/* Section 1: Acceptance of Terms */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("acceptance")}
                                                    className="w-full text-sm text-blue p-4 text-left font-semibold"
                                                >
                                                    1. Acceptance of Terms
                                                </button>
                                                {isTermsSubOpen.acceptance && (
                                                    <div className="p-4 text-sm border-t border-gray-200">
                                                        <p>By accessing or using Acolyte, you agree to comply with these Terms & Conditions. If you do not agree, do not use the platform.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 2: User Obligations */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("obligations")}
                                                    className="w-full text-sm text-blue p-4 text-left font-semibold"
                                                >
                                                    2. User Obligations
                                                </button>
                                                {isTermsSubOpen.obligations && (
                                                    <div className="p-4 text-sm border-t border-gray-200">
                                                        <ul>
                                                            <li>Use the platform lawfully and responsibly.</li>
                                                            <li>Not misuse AI-generated content for illegal, harmful, or deceptive purposes.</li>
                                                            <li>Not upload infringing, defamatory, or unlawful content.</li>
                                                            <li>Acknowledge that Acolyte does not verify user-submitted content and is not liable for inaccuracies.</li>
                                                            <li>Backtracking Feature Disclaimer: Users can trace AI-generated responses back to their uploaded content, but this does not imply endorsement or validation by Acolyte.</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 3: Intellectual Property Rights */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("intellectual")}
                                                    className="w-full text-sm text-blue  p-4 text-left font-semibold"
                                                >
                                                    3. Intellectual Property Rights
                                                </button>
                                                {isTermsSubOpen.intellectual && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <ul>
                                                            <li>Acolyte owns all proprietary rights, trademarks, and AI models.</li>
                                                            <li>Users retain ownership of their uploaded content but grant Acolyte a limited, non-exclusive license to process and improve services.</li>
                                                            <li>No AI-generated outputs shall be claimed as proprietary or original work by users.</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 4: Limitation of Liability */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("liability")}
                                                    className="w-full text-sm text-blue p-4 text-left font-semibold"
                                                >
                                                    4. Limitation of Liability
                                                </button>
                                                {isTermsSubOpen.liability && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <ul>
                                                            <li>Acolyte provides services “as is” and “as available” without warranties of any kind.</li>
                                                            <li>We do not guarantee the accuracy, completeness, or applicability of AI-generated outputs.</li>
                                                            <li>We are not responsible for any decisions made based on AI recommendations.</li>
                                                            <li>No liability for direct, indirect, incidental, or consequential damages arising from platform use.</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 5: Indemnification */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("indemnification")}
                                                    className="w-full text-sm text-blue p-4 text-left font-semibold"
                                                >
                                                    5. Indemnification
                                                </button>
                                                {isTermsSubOpen.indemnification && (
                                                    <div className="p-4 text-sm border-t border-gray-200">
                                                        <ul>
                                                            <li>Misuse of AI-generated content.</li>
                                                            <li>Violations of intellectual property rights.</li>
                                                            <li>Any legal disputes arising from uploaded materials.</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 6: Termination of Use */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("termination")}
                                                    className="w-full text-sm  text-blue p-4 text-left font-semibold"
                                                >
                                                    6. Termination of Use
                                                </button>
                                                {isTermsSubOpen.termination && (
                                                    <div className="p-4 text-sm border-t border-gray-200">
                                                        <p>We reserve the right to suspend or terminate accounts without prior notice if:</p>
                                                        <ul>
                                                            <li>A user violates these Terms.</li>
                                                            <li>There is suspicious or harmful activity.</li>
                                                        </ul>
                                                        <p>Users may also request account deletion by contacting support@myacolyte.com.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 7: Dispute Resolution & Governing Law */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("dispute")}
                                                    className="w-full text-sm text-blue p-4 text-left font-semibold"
                                                >
                                                    7. Dispute Resolution & Governing Law
                                                </button>
                                                {isTermsSubOpen.dispute && (
                                                    <div className="p-4 text-sm border-t border-gray-200">
                                                        <p>Jurisdiction: These terms are governed by the laws of India (or other applicable jurisdiction).</p>
                                                        <p>Dispute Resolution: Any disputes shall first attempt to be resolved amicably. If unresolved, they will be settled through binding arbitration in Bangalore, India.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 8: Modifications to Terms */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("modifications")}
                                                    className="w-full text-sm text-blue p-4 text-left font-semibold"
                                                >
                                                    8. Modifications to Terms
                                                </button>
                                                {isTermsSubOpen.modifications && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>Acolyte reserves the right to modify these Terms at any time. Continued use after updates constitutes acceptance.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 9: Final Provisions */}
                                            <div>
                                                <button
                                                    onClick={() => toggleTermsSection("finalProvisions")}
                                                    className="w-full p-4 text-blue text-sm text-left font-semibold"
                                                >
                                                    Final Provisions
                                                </button>
                                                {isTermsSubOpen.finalProvisions && (
                                                    <div className="p-4 border-t text-sm border-gray-200">
                                                        <p>If any clause is deemed unenforceable, the remaining terms remain in effect.</p>
                                                        <p>Users agree not to hold Acolyte accountable for technical failures, downtimes, or interruptions.</p>
                                                        <p>For questions, contact support@myacolyte.com.</p>
                                                        <p>By using Acolyte, you acknowledge and agree to these Terms & Conditions.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* <DialogFooter >
                    <Button className="bg-purple-500" type="submit">close</Button>
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}
