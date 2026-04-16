"use client";

import { LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-9 shrink-0 rounded-full bg-muted/80 animate-pulse" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" className="transition-all duration-300" asChild>
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          登录
        </Link>
      </Button>
    );
  }

  const u = session.user;
  const initials =
    u.name
      ?.split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || u.email?.slice(0, 2).toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 transition-all duration-300 hover:ring-2 hover:ring-primary/20">
          <Avatar className="h-9 w-9 border border-border/60 shadow-sm">
            <AvatarImage src={u.image ?? undefined} alt="" />
            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium leading-none">{u.name || "用户"}</p>
            <p className="text-xs leading-none text-muted-foreground">{u.email}</p>
            {u.role ? <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 pt-1">角色 · {u.role}</p> : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="transition-colors duration-300">
          <Link href="/account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            个人中心
          </Link>
        </DropdownMenuItem>
        {u.role === "admin" ? (
          <DropdownMenuItem asChild className="transition-colors duration-300">
            <Link href="/admin/dashboard" className="cursor-pointer">
              管理后台
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive transition-colors duration-300"
          onClick={() => void signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
