export default function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse flex flex-col justify-between h-55">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
    </div>
  );
}
