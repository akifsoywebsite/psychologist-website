import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { ContactContent } from "@/lib/types";

interface SocialLinksProps {
  contact: ContactContent;
  className?: string;
}

interface SocialPlatform {
  icon: IconType;
  label: string;
  href?: string;
}

const iconButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-full bg-accent text-foreground transition-colors hover:bg-primary hover:text-primary-foreground";

export default function SocialLinks({
  contact,
  className = "flex items-center gap-3",
}: SocialLinksProps) {
  const platforms: SocialPlatform[] = [
    { icon: FaInstagram, label: "Instagram", href: contact.instagramUrl },
    { icon: FaFacebookF, label: "Facebook", href: contact.facebookUrl },
    { icon: FaLinkedinIn, label: "LinkedIn", href: contact.linkedinUrl },
    { icon: FaTiktok, label: "TikTok", href: contact.tiktokUrl },
    { icon: FaWhatsapp, label: "WhatsApp", href: contact.whatsappUrl },
    { icon: FaYoutube, label: "YouTube", href: contact.youtubeUrl },
  ];

  const activePlatforms = platforms.filter((platform) => platform.href);

  if (activePlatforms.length === 0) return null;

  return (
    <div className={className}>
      {activePlatforms.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={iconButtonClassName}
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}
