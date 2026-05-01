// 'use client';

// import { useRouter } from 'next/navigation';
// import InternalAjukanKerjasamaForm from '@/app/internal/data_pengajuan/AjukanKerjasamaForm';

// type AjukanFormProps = {
//   onClose?: () => void;
// };

// export default function AjukanForm({ onClose }: AjukanFormProps) {
//   const router = useRouter();

//   return (
//     <InternalAjukanKerjasamaForm
//       enableAppearanceEdit
//       appearanceStorageKey="admin-pengajuan-appearance-v1"
//       onCancel={() => {
//         if (onClose) {
//           onClose();
//           return;
//         }

//         router.push('/admin/data_pengajuan');
//       }}
//       onSubmitted={() => {
//         if (onClose) {
//           onClose();
//           return;
//         }

//         router.push('/admin/data_pengajuan');
//       }}
//     />
//   );
// }
