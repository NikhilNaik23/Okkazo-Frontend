import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { uploadVendorApplicationImage } from '../../../store/slices/authSlice';

const VendorImagesOnboardingModal = ({ isOpen }) => {
  const dispatch = useDispatch();
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => !!profileFile && !!bannerFile && !isSubmitting, [profileFile, bannerFile, isSubmitting]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileFile || !bannerFile) {
      toast.error('Please upload both profile and banner images.');
      return;
    }

    setIsSubmitting(true);

    try {
      const profileResult = await dispatch(
        uploadVendorApplicationImage({ imageType: 'profile', file: profileFile })
      );
      if (uploadVendorApplicationImage.rejected.match(profileResult)) {
        throw new Error(profileResult.payload || 'Failed to upload profile image');
      }

      const bannerResult = await dispatch(
        uploadVendorApplicationImage({ imageType: 'banner', file: bannerFile })
      );
      if (uploadVendorApplicationImage.rejected.match(bannerResult)) {
        throw new Error(bannerResult.payload || 'Failed to upload banner image');
      }

      toast.success('Images uploaded successfully');
      setProfileFile(null);
      setBannerFile(null);
    } catch (error) {
      toast.error(error?.message || 'Failed to upload images');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0b2d49]/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-[#0b2d49]/20 overflow-hidden">
        <div className="p-6 border-b border-[#708aa0]/15">
          <h2 className="text-xl font-black text-[#0b2d49] tracking-tight">Upload your business images</h2>
          <p className="text-sm text-[#708aa0] font-medium mt-2">
            Please upload both a profile image and a banner image to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block p-5 rounded-2xl border border-[#708aa0]/15 bg-[#e9eff1]/40">
              <p className="text-xs font-black uppercase tracking-widest text-[#0b2d49]">Profile image</p>
              <p className="text-xs text-[#708aa0] font-medium mt-1">JPEG or PNG</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                className="mt-3 w-full text-sm text-[#0b2d49] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#0b2d49] file:text-white file:font-bold hover:file:opacity-90"
              />
              {profileFile && (
                <p className="mt-2 text-[11px] text-[#5a5b44] font-bold truncate">{profileFile.name}</p>
              )}
            </label>

            <label className="block p-5 rounded-2xl border border-[#708aa0]/15 bg-[#e9eff1]/40">
              <p className="text-xs font-black uppercase tracking-widest text-[#0b2d49]">Banner image</p>
              <p className="text-xs text-[#708aa0] font-medium mt-1">JPEG or PNG</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="mt-3 w-full text-sm text-[#0b2d49] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#0b2d49] file:text-white file:font-bold hover:file:opacity-90"
              />
              {bannerFile && (
                <p className="mt-2 text-[11px] text-[#5a5b44] font-bold truncate">{bannerFile.name}</p>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 rounded-2xl font-black text-white bg-[#0b2d49] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Uploading…' : 'Upload & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorImagesOnboardingModal;
