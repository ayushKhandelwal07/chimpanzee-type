import clsx from 'clsx';
import { motion } from 'framer-motion';

interface BubbleProps {
  username?: string;
  value: string;
  isYou?: boolean;
  type?: 'notification' | 'message';
}

export default function Bubble({ username, value, isYou, type = 'message' }: BubbleProps) {
  const isNotification = type === 'notification';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex w-full flex-col gap-1', [
        isNotification ? 'items-center' : (isYou ? 'items-end' : 'items-start'),
      ])}
    >
      {username && !isNotification && (
        <span
          className={clsx('text-xs font-medium', [
            isYou ? 'text-fg/80' : 'text-hl',
          ])}
        >
          {username}
        </span>
      )}

      {/* for message from me or the other for styling of the mesage  */}
      <div
        className={clsx(
          'max-w-[80%] break-words rounded-lg px-3 py-2 text-sm',
          [
            isNotification
              ? 'bg-hl/20 text-hl italic text-center'
              : isYou
              ? 'bg-fg text-bg'
              : 'bg-bg/30 text-fg ring-1 ring-fg/60 ring-offset-1 ring-offset-bg',
          ]
        )}
      >
        {value}
      </div>
    </motion.div>
  );
}
