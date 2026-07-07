import { FiArrowRight, FiLock, FiShield, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface AccountSecurityCardProps {
    onOpenChangePassword: () => void;
    onOpenDeleteAccount: () => void;
}

export function AccountSecurityCard({ onOpenChangePassword, onOpenDeleteAccount }: AccountSecurityCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700">
                                <FiShield className="h-5 w-5" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">Thay đổi mật khẩu đăng nhập</p>
                                <p className="text-sm text-gray-600">
                                    Cập nhật mật khẩu định kỳ để tăng độ an toàn cho tài khoản của bạn.
                                </p>
                            </div>
                        </div>

                        <Button className="gap-2" onClick={onOpenChangePassword}>
                            Đổi mật khẩu
                            <FiArrowRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-md border border-white bg-white/80 px-3 py-2">
                            <FiLock className="h-4 w-4 text-gray-500" />
                            <span>Tối thiểu 8 ký tự</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border border-white bg-white/80 px-3 py-2">
                            <FiShield className="h-4 w-4 text-gray-500" />
                            <span>Đổi thành công sẽ đăng xuất tự động</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-red-100 p-2.5 text-red-700">
                                <FiTrash2 className="h-5 w-5" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">Xóa tài khoản</p>
                                <p className="text-sm text-gray-600">
                                    Xóa vĩnh viễn tài khoản của bạn. Hành động này không thể khôi phục.
                                </p>
                            </div>
                        </div>

                        <Button variant="danger" className="gap-2" onClick={onOpenDeleteAccount}>
                            <FiTrash2 className="h-4 w-4" />
                            Xóa tài khoản
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
